import { Link, useNavigate } from "react-router-dom";
import { ROOMS } from "../data";
import RoomCard from "../components/RoomCard";

export default function Lobby() {
  const navigate = useNavigate();
  return (
    <>
      <section className="banner">
        <div className="banner-text">
          <h2>
            Быстрые игровые комнаты
            <br />
            на бонусные баллы
          </h2>
          <p>Выбирай комнату, заходи, выигрывай!</p>
          <button className="btn btn-yellow banner-btn" onClick={() => navigate("/auto-match")}>
            Играть
          </button>
        </div>

        <div className="banner-art" aria-hidden="true">
          <span className="spark" style={{ width: 7, height: 7, top: "16%", right: 60 }} />
          <span className="spark" style={{ width: 5, height: 5, top: "58%", right: 380 }} />
          <span className="spark" style={{ width: 6, height: 6, bottom: "22%", left: 36 }} />
          <span className="spark" style={{ width: 4, height: 4, top: "30%", right: 240 }} />

          <span className="coin3d c1" />
          <span className="coin3d c2" />
          <span className="coin3d c3" />
          <span className="coin3d c4" />

          <div className="globe">
            <span className="lotto-ball blue" style={{ width: 58, height: 58, left: "6%", top: "22%" }}>
              <i className="patch" style={{ fontSize: 20 }}>23</i>
            </span>
            <span
              className="lotto-ball green"
              style={{ width: 48, height: 48, right: "10%", top: "16%", animationDelay: "0.4s" }}
            >
              <i className="patch" style={{ fontSize: 17 }}>28</i>
            </span>
            <span
              className="lotto-ball orange"
              style={{ width: 54, height: 54, left: "16%", bottom: "14%", animationDelay: "0.8s" }}
            >
              <i className="patch" style={{ fontSize: 19 }}>17</i>
            </span>
            <span
              className="lotto-ball red"
              style={{ width: 44, height: 44, right: "16%", top: "44%", animationDelay: "1.2s" }}
            >
              <i className="patch" style={{ fontSize: 16 }}>31</i>
            </span>
            <span
              className="lotto-ball white"
              style={{ width: 40, height: 40, right: "36%", bottom: "22%", animationDelay: "1.6s" }}
            >
              <i className="patch" style={{ fontSize: 15 }}>5</i>
            </span>
          </div>
          <div className="globe-base" />

          <div className="gift">
            <span className="box" />
            <span className="lid" />
            <span className="ribbon-v" />
            <span className="bow" />
          </div>
        </div>
      </section>

      <div className="section-head">
        <h3>Популярные комнаты</h3>
        <Link to="/games">Все комнаты →</Link>
      </div>

      <div className="grid-cards">
        {ROOMS.map((r) => (
          <RoomCard key={r.id} room={r} />
        ))}
      </div>
    </>
  );
}
