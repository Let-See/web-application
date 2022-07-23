import React, { useEffect, useState } from "react";
import "./App.css";
import "./letsee/letsee";
import { ItemDetails } from "./components/details/itemDetails";
import { CardItemList } from "./components/card/cardItemList";
import { LetSeeContext } from "./letsee/letsee-context";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import LetSee from "./letsee/letsee";
const letsee = new LetSee();
function App() {
  const [requestDetails, setRequestDetails] = useState(letsee.showDetails);
  const [cards, setCards] = useState(letsee.cards);
  letsee.subscribe(setRequestDetails, async (ls) => {
    setRequestDetails(ls.showDetails);
    setCards(ls.visibleCards ?? ls.cards);
  });

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
