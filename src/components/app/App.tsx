import React, { useContext, useEffect, useState } from "react";
import "./App.css";
import "@letsee/letsee";
import { ItemDetails } from "../details/itemDetails";
import { CardItemList } from "@components/card/cardItemList";
import { LetSeeContext } from "@letsee/letsee-context";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
let unsafeReference = {};

function App() {
  const letsee = useContext(LetSeeContext);
  const [requestDetails, setRequestDetails] = useState(letsee.showDetails);
  const [cards, setCards] = useState(letsee.cards);

  useEffect(() => {
    letsee.subscribe(unsafeReference, async (ls) => {
      console.log("updating requests");
      setRequestDetails(ls.showDetails);
      setCards(ls.visibleCards ?? ls.cards);
    });
    return () => {
      console.log("unmounted");
      letsee.unsubscribe(unsafeReference);
    };
  }, []);

  useEffect(() => {
    console.log("cards:", cards);
  }, [cards]);

  return (
    <div className="App">
      <LetSeeContext.Provider value={letsee}>
        {requestDetails ? <ItemDetails item={requestDetails!} /> : ""}
        <CardItemList items={cards} />
      </LetSeeContext.Provider>
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
}

export default App;
