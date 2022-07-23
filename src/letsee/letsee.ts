import LetSeeEvent, { IEvent } from "@letsee/letsee-event"
import { ConnectionConfig, ICardItem, IKeyValue } from "@letsee/letsee-interfaces"

export default class LetSee {
    baseURL?: string
    private _events: Array<IEvent> = []
    private _cards: Array<ICardItem> = []
    visibleCards?:Array<ICardItem>
    private observers: Array<[Object, (letSee: LetSee)=>{}]> = []
    private _showDetails: IEvent | null  = null
    private ws?: WebSocket 
    private wsRestartTimer?: NodeJS.Timer
    set showDetails(newValue: IEvent | null) {
        if (newValue === this._showDetails) {return}
        this._showDetails = newValue
        this.observers.forEach(ob => ob[1](this))
    }
    get showDetails(): IEvent | null {
        return this._showDetails 
    }

    set cards(newValue: Array<ICardItem>) {
        this._cards = newValue
        this.observers.forEach(ob => ob[1](this))
    }
    get cards(): Array<ICardItem> {
        return  this._cards 
    }

    set events(newValue: Array<IEvent>) {
        this._events = newValue
        this.observers.forEach(ob => ob[1](this))
    }
    get events(): Array<IEvent> {
        return this._events 
    }
    
    constructor(baseURL?: string){
        this.baseURL = baseURL
        this.events = []
        this.cards = []
        this.showDetails = null
        this.observers = []
        this.getConfig()
    }

    subscribe(obj: Object,cb: (letSee: LetSee)=>{}) {
        this.observers.push([obj,cb])
    }

    ubsubscribe(obj: Object) {
        this.observers = this.observers.filter((item) => item[0] === obj)
    }

    search(query: string) {
        let q = query.toLowerCase()
        if (q.length === 0) {
            this.visibleCards = undefined
        }
        this.visibleCards = this.cards.filter(item => item.id.toLowerCase().includes(q) || item.url.toLowerCase().includes(q))
        this.observers.forEach(ob => ob[1](this))
    }

    clear() {
        this.events = []
        this.cards = []
        this.visibleCards = undefined
        this.showDetails = null
    } 

    beutifyBody(body: string) {
        try {
            return (
                '<pre><code class="json">' +
                JSON.stringify(JSON.parse(body), null, 2) +
                "</code></pre>"
            );
        } catch (error) {
            return body;
        }    
    }

    getCurrentTime(): String {
        var today = new Date();
        var date =
            today.getFullYear() +
            "-" +
            (today.getMonth() + 1) +
            "-" +
            today.getDate();
        var time =
            today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
        return date + " " + time;
    }

    onReceive(event: IEvent) {
        let e = new LetSeeEvent(event)
        const itemIndex = this.events.findIndex(item => item.id === event.id)
        let cardItem = this.makeCardItem(e)
        if (itemIndex !== -1) {
            this._events[itemIndex] = e
            this.events = this._events
            const cardIndex = this.cards.findIndex(item => item.id === event.id)
            this._cards[cardIndex] = cardItem
            this.cards = this._cards
        } else {
            this.events = this.events.concat([e])
            this.cards = this.cards.concat([cardItem])
        }
    }

    private makeCardItem(event: IEvent): ICardItem {
        const request = event.request;
        const response = event.response;
        const id = event.id;
        const url = this.replaceBaseURL(request.url)
        const method = request.method;
        const waiting = event.waiting;
        const isSuccess = event.isSuccess()
        const status_code = response?.status_code ?? request.status_code
        const tookTime = `${response?.took_time ?? "-"}`
        const responseLength = response?.content_length ?? 0
        const requestLength = request.content_length ?? 0
        const responseContentLength = responseLength > 1000 ? this.byteToKB(responseLength) + " kilobytes" : responseLength + " bytes";
        const requestContentLength = responseLength > 1000 ? this.byteToKB(requestLength) + " kilobytes" : requestLength + " bytes";

        return {
            id,
            url,
            method,
            waiting,
            isSuccess,
            status_code,
            tookTime,
            requestLength: requestContentLength,
            responseLength: responseContentLength
        }
    }

    private byteToKB(bytes: number): number {
        return bytes / 1000
    }

    private replaceBaseURL(url?: string): string {
        if (url == null) {return ""}
        if (this.baseURL != null) {
            return url.replace(this.baseURL, "<span class=\"base\"> {BASE_URL} </span>/");
        } else {
            return url
        }
    }
    private findRequest(id: string): IEvent | undefined {
        return this.events.filter(request => request.id === id)[0]
    }

    showRequestDetails(id: string){
        let selectedEvent = this.findRequest(id)
        if (selectedEvent === undefined  || selectedEvent.waiting) {return}
        this.showDetails = this.showDetails === selectedEvent ? null : selectedEvent
    }

    private getConfig() {
        fetch(new  URL("api/config","http://localhost:3000/"))
        .then(configs => configs.json())
        .then((configs: ConnectionConfig) => {
            this.baseURL = configs.baseURL
            this.connectWS(configs)
        })
    }

    private connectWS(configs: ConnectionConfig) {
        const location = window.location
        let timer = this.wsRestartTimer
        var wesocketAddress =
        "ws://" + location.hostname + ":" + configs.webSocketPort + "/api/ws";
        // Let us open a web socket
        const websocket= new WebSocket(wesocketAddress)

        websocket.onopen = () => {
            timer = undefined
            websocket.send('{"connected": true}');
        };

        websocket.onmessage = (evt) => {
            var data = evt.data;
            var received_msg: IEvent = JSON.parse(data);
            this.onReceive(received_msg)
        };

        websocket.onclose = () => {
            timer = undefined
            // websocket is closed.
            timer = setTimeout(()=> {
                this.connectWS(configs)
            }, 3000);
        };
        
        this.ws = websocket
    }

    copy(requestId: string): string {
        let selectedEvent = this.findRequest(requestId)
        if (selectedEvent === undefined  || selectedEvent.waiting) {return ""}
        let requestSummery = `${selectedEvent.request.method} code: ${selectedEvent.request.status_code} -> ${selectedEvent.request.url}
        request-headers: ${this.headerToString(selectedEvent.request.headers)}\n
        request-body: ${JSON.stringify(selectedEvent.request.body, null, 2)}\n
        response-headers: ${this.headerToString((selectedEvent.response?.headers) ?? [])}\n
        response-body: ${JSON.stringify(selectedEvent.response?.body, null, 2)}\n
        `
        
        return requestSummery
    }

    private headerToString(headers: Array<IKeyValue>): string {
        return headers.map((k) => "\""+k.key+"\" : \""+k.value+"\"").join(",\n")
    }
}