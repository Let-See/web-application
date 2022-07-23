import React from "react"; // we need this to make JSX compile
import { ICardItem } from "@letsee/letsee-interfaces";
interface IProps {
  item: ICardItem;
  onClick: (id: string) => void;
  onCopy: (id: string) => void;
}
export const ItemCard = (card: IProps) => {
  const responseClass = card.item.waiting
    ? " pending-response "
    : card.item.isSuccess
    ? "success"
    : "failure";
  const success = card.item.waiting
    ? ""
    : card.item.isSuccess
    ? "SUCCESS"
    : "FAILED";

  return (
    <div
      className={responseClass + "animatable request card"}
      id={card.item.id}
      request-id={card.item.id}
      onClick={(e) => card.onClick(card.item.id)}
    >
      <div className="url">
        <span className={card.item.method + " badge method"}>
          {card.item.method}
        </span>
        <span
          className="address"
          dangerouslySetInnerHTML={{ __html: card.item.url }}
        ></span>
      </div>
      <div className="meta">
        <div className="response">
          {card.item.waiting ? (
            <span>Requesting...</span>
          ) : (
            <span>
              <span className={"badge " + responseClass}>{success}</span>
              <span className="badge">{card.item.status_code}</span>
              <span className="badge length">
                <strong>{card.item.responseLength}</strong>
              </span>
            </span>
          )}
        </div>
        <div className="date-container">
          <span className="time">
            <strong>{card.item.tookTime}</strong>ms
          </span>
          <span className="date">{card.item.tookTime}</span>
          <button
            className="copy"
            title="copy"
            onClick={(e) => {
              card.onCopy(card.item.id);
              if (e.stopPropagation) e.stopPropagation();
            }}
          >
            copy
          </button>
        </div>
      </div>
    </div>
  );
};
