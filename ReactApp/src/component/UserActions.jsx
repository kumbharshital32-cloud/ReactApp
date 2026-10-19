function UserActions(props)
{
    const user=props.data

    return (
         <div className="d-flex gap-2 align-items-center h-100">
      <button className="btn btn-sm btn-outline-primary" onClick={() => props.onEdit(user)}>
        Edit
      </button>
      <button className="btn btn-sm btn-outline-danger" onClick={() => props.onDelete(user)}>
        Delete
      </button>
    </div>
    )
}

export default UserActions