import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import MatchCard from "./components/MatchCard";

function App() {
  const [matches, setMatches] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");

  async function fetchMatches() {
    const { data, error } = await supabase
      .from("matches")
      .select("*")
      .order("id");

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    setErrorMsg("");
    setMatches(
      data.map((m) => ({
        id: m.id,
        homeTeam: m.team1,
        awayTeam: m.team2,
        date: m.date,
        venue: m.venue,
        price: m.price,
        availableSeats: m.available_seats,
      }))
    );
  }

    useEffect(() => {
    fetchMatches();

    const channel = supabase
      .channel("matches-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "matches" },
        () => fetchMatches()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <main>
      <Navbar />
      <Hero />
      <section id="matches">
        <h2>Upcoming Matches</h2>
        {errorMsg && <p style={{ color: "red" }}>Error: {errorMsg}</p>}
        <p>Matches loaded: {matches.length}</p>
        <div className="match-grid">
          {matches.map((match) => (
            <MatchCard key={match.id} {...match} onBooked={fetchMatches} />
          ))}
        </div>
      </section>
    </main>
  );
}

export default App;