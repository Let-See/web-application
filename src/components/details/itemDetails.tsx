import React, { useState } from "react";
import { IEvent } from "@letsee/letsee-event";
import ReactJson from "react-json-view";
import { IKeyValue } from "@letsee/letsee-interfaces";
interface IProps {
  item: IEvent;
}
enum Tabs {
  responseBody,
  requestBody,
  responseHeader,
  requestHeader,
}
export const ItemDetails = (prop: IProps) => {
  const [selectedTab, setSelectedTab] = useState(Tabs.requestBody);
  const tabsArray = [
    "Response Data",
    "Request Data",
    "Response Headers",
    "Request Headers",
  ];
  const headerToString = (headers: Array<IKeyValue>): string => {
    return headers
      .map(
        (k) =>
          '<p class="header-item"><span class="header-key">' +
          k.key +
          '</span> : <span class="header-value">' +
          k.value +
          "</span></p>"
      )
      .join("\n");
  };

  const isJsonString = (str: string) => {
    try {
      JSON.parse(str);
    } catch (e) {
      return false;
    }
    return true;
  };
  return (
    <div className="main-viewer">
      <div className="wrapper data-container fade-animatable">
        <ul className="tabs clearfix" data-tabgroup="first-tab-group">
          {tabsArray.map((tab, index) => (
            <li key={index}>
              <a
                href="#"
                className={selectedTab === index ? "active" : "hide"}
                onClick={() => setSelectedTab(index)}
              >
                {tab}
              </a>
            </li>
          ))}
        </ul>
        <section className="tabgroup fade-animatable" id="first-tab-group">
          <div
            className="tab-container fade-animatable"
            id="request_container"
            hidden={selectedTab !== 0}
          >
            {/* <div id="request_params_container">
              <div id="request_url">{prop.item.request.url}</div>
              <div id="params_title">Query Parameters</div>
              <div id="request_params">{prop.item.request.url}</div>
            </div> */}
            <div id="request_data">
              {isJsonString(prop.item.request.body ?? "") ? (
                <ReactJson
                  src={JSON.parse(prop.item.request.body ?? "")}
                  theme="solarized"
                />
              ) : (
                <div
                  dangerouslySetInnerHTML={{
                    __html: prop.item.request.body ?? "",
                  }}
                ></div>
              )}
            </div>
          </div>
          <div
            className="tab-container"
            id="response_container"
            hidden={selectedTab !== 1}
          >
            <div id="response_data">
              {isJsonString(prop.item.response?.body ?? "") ? (
                <ReactJson
                  src={JSON.parse(prop.item.response?.body ?? "")}
                  theme="solarized"
                />
              ) : (
                <div
                  dangerouslySetInnerHTML={{
                    __html: prop.item.response?.body ?? "",
                  }}
                ></div>
              )}
            </div>
          </div>
          <div
            className="tab-container fade-animatable headers-container"
            id="request_headers"
            hidden={selectedTab !== 2}
            dangerouslySetInnerHTML={{
              __html: headerToString(prop.item.request.headers),
            }}
          ></div>
          <div
            className="tab-container fade-animatable headers-container"
            hidden={selectedTab !== 3}
            dangerouslySetInnerHTML={{
              __html: headerToString(prop.item.response?.headers ?? []),
            }}
          ></div>
        </section>
      </div>
    </div>
  );
};
