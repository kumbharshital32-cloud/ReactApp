import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { AgGridReact } from 'ag-grid-react'
import UserActions from './UserActions'
import { useAuth0 } from '@auth0/auth0-react'


function UserComponent() {
  // Sample data, same shape as your API's JSON (camelCase)
  const [users,setUsers] = useState([])
  const { isAuthenticated, getAccessTokenSilently } = useAuth0()
  const navigate=useNavigate()

  function handleEdit(user) {
    navigate(`/users/edit/${user.id}`)
  }


  async function handleDelete(user) {
    if (!window.confirm(`Delete ${user.name}?`)) return

    try {
      const token = await getAccessTokenSilently()
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/${user.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) {
        alert(`Delete failed (${response.status})`)
        return
      }

      setUsers(prev => prev.filter(u => u.id !== user.id))
    } catch (err) {
      alert(err.message)
    }
  }

   const columnDefs = [
    { field: 'id', headerName: 'ID', width: 80 },
    { field: 'name', headerName: 'Name' },
    { field: 'age', headerName: 'Age', width: 100 },
    { field: 'city', headerName: 'City' },
    { field: 'state', headerName: 'State' },
    { field: 'pincode', headerName: 'Pincode' },
  ]

  if (isAuthenticated) {
    columnDefs.push({
      headerName: 'Actions',
      cellRenderer: UserActions,
      cellRendererParams: { onEdit: handleEdit, onDelete: handleDelete },
      width: 160,
      sortable: false,
      filter: false,
    })
  }


  useEffect(()=>{
    async function loadUsers() {
        const response=await fetch(`${import.meta.env.VITE_API_URL}/api/users`)
        const data=await response.json()
        setUsers(data)
    }
    loadUsers()
  },[])


  return (
    <div className="container mt-4">
      <h1 className="mb-3">Users</h1>

      {/* The grid needs a height, otherwise it's 0px tall and invisible */}
      <div style={{ height: 400 }}>
        <AgGridReact rowData={users} columnDefs={columnDefs} />
      </div>
    </div>
  )
}

export default UserComponent
