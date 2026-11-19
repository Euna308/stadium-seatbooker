import { useState } from "react";
import { supabase } from "../supabase";

function MatchCard({ id, homeTeam, awayTeam, date, venue, price, availableSeats, onBooked }) {
  const [isSaved, setIsSaved] = useState(false);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  async function handleBook() {
    if (!name.trim()) {
      setMessage("Please enter your name first");
      return;
    }

    // 1. insert a booking
    const { error: insertError } = await supabase
      .from("bookings")
      .insert({
  match_id: id,
  user_name: name,
  match_title: homeTeam + " vs " + awayTeam,
  tickets: 1,
  total_price: price,
});

    if (insertError) {
      setMessage("Booking failed: " + insertError.message);
      return;
    }

    // 2. reduce available seats by 1
    const { error: updateError } = await supabase
      .from("matches")
      .update({ available_seats: availableSeats - 1 })
      .eq("id", id);

    if (updateError) {
      setMessage("Seat update failed: " + updateError.message);
      return;
    }

    setMessage("Ticket booked!");
    setName("");
    onBooked();
  }

  return (
    <article className="match-card">
      <h2>{homeTeam} vs {awayTeam}</h2>
      <p>{date}</p>
      <p>{venue}</p>
      <p>Price: ₹{price}</p>
      <p>Seats left: {availableSeats}</p>

      <input
        type="text"
        placeholder="Your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button type="button" onClick={handleBook} disabled={availableSeats <= 0}>
        {availableSeats <= 0 ? "Sold out" : "Book tickets"}
      </button>
      <button type="button" onClick={() => setIsSaved(!isSaved)}>
        {isSaved ? "♥ Saved" : "♡ Save match"}
      </button>
      {message && <p>{message}</p>}
    </article>
  );
}

export default MatchCard;