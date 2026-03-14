import { Outlet } from "react-router-dom"
import Sidebar from "./Sidebar"
import "./MainLayout.scss"

export default function MainLayout({ role = "receptionist" }) {
  return (
    <div className="main-layout">
      <Sidebar role={role} />
      <main className="main-layout__content">
        <Outlet />
      </main>
    </div>
  )
}
