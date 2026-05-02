import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function Layout({ children }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#0b1929" }}>
      <Sidebar />
      <div
        style={{
          flex: 1,
          marginLeft: "260px",
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
        }}
      >
        <Topbar />
        <main style={{ flex: 1 }}>{children}</main>
      </div>
    </div>
  );
}
