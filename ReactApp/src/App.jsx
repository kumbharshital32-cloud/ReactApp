import { Routes,Route,Link } from 'react-router'
import './App.css'
import UserComponent from './component/UserComponent'
import AddUser from './component/AddUser'
import { useAuth0, withAuthenticationRequired } from '@auth0/auth0-react'

const ProtectedAddUser = withAuthenticationRequired(AddUser)

function App() {
  const { isAuthenticated, user, loginWithRedirect, logout } = useAuth0()

  return (
    <>
        <nav className="navbar navbar-dark bg-dark px-3">
        <Link className="navbar-brand" to="/">Users App</Link>

        <div className="d-flex gap-2 align-items-center">

          {isAuthenticated ? (
            <>
                      <Link className="btn btn-outline-light btn-sm" to="/users/add">Add User</Link>
              <span className="text-light small">{user?.email}</span>
              <button className="btn btn-light btn-sm"
                onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}>
                Logout
              </button>
            </>
          ) : (
            <button className="btn btn-light btn-sm" onClick={() => loginWithRedirect()}>
              Login
            </button>
          )}
        </div>
      </nav>


      <Routes>
        <Route path="/" element={<UserComponent />} />
        <Route path="/users/add" element={<ProtectedAddUser />} />
        <Route path="/users/edit/:id" element={<ProtectedAddUser />} />

      </Routes>
    </>
  )
}

export default App
