import React, { useContext } from "react";

import { LetSeeContext } from "@letsee/letsee-context";
import { ICardItem } from "@letsee/letsee-interfaces";
import { ItemCard } from "@components/card/cardItem";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
interface IProps {
  items: Array<ICardItem>;
}
export const CardItemList = (prop: IProps) => {
  const letSee = useContext(LetSeeContext);
  const showCopiedToast = () => {
    toast.success("Copied into your clipoard.", {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };

  const clearEvents = () => {
    letSee.clear();
  };
  return (
    <div className="main-requests">
      <div className="search_box">
        <input
          className="textbox"
          id="url_search"
          placeholder="Search in URLs"
          type="text"
          onChange={(e) => {
            console.log("something happends", e);
            letSee.search(e.target.value);
          }}
        />
      </div>
      <div className="base-url">
        BASE URL:
        <div>
          <strong id="base_url"> {letSee.baseURL ?? "- base url -"}</strong>
        </div>
      </div>
      <div id="requests_container">
        {prop.items.map((item) => (
          <ItemCard
            item={item}
            key={item.id}
            onClick={(id: string) => {
              letSee.showRequestDetails(id);
            }}
            onCopy={(id: string) => {
              const requestSummery = letSee.copy(id);
              navigator.clipboard.writeText(requestSummery);
              showCopiedToast();
            }}
          />
        ))}
      </div>
      <div
        className="horizontal-vertical-center"
        id="empty-box"
        hidden={prop.items.length > 0}
      >
        <strong className="empty-text">No Request Received Yet.</strong>
        <div>
          <img className="empty-image" src="/empty.png" alt=""></img>
        </div>
      </div>
      <button
        id="clear-button"
        value="Clear"
        onClick={() => {
          clearEvents();
        }}
      >
        Clear
      </button>
    </div>
  );
};
