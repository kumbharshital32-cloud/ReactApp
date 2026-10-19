import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'

import { useAuth0 } from '@auth0/auth0-react'


function AddUser() {
  const { id } = useParams()
  const isEdit = Boolean(id)

  const [saving, setSaving] = useState(false)
  const [serverError, setServerError] = useState('')
  const navigate = useNavigate()
  const { getAccessTokenSilently } = useAuth0()

  // One state object for the whole form
  const [form, setForm] = useState({
    name: '', age: '', city: '', state: '', pincode: '',
  })
 const [errors, setErrors] = useState({})
  // One handler for all inputs: uses the input's "name" attribute
  function handleChange(e) {
    const { name, value } = e.target
    setForm({ ...form, [name]: value })
    setErrors({ ...errors, [name]: undefined })
  }
function validate(values) {
  const errs = {}
  const name = values.name.trim()

  if (!name) errs.name = 'Name is required'
  else if (name.length < 2 || name.length > 100) errs.name = 'Name must be 2–100 characters'

  if (values.age === '') errs.age = 'Age is required'
  else if (!Number.isInteger(Number(values.age)) || values.age < 0 || values.age > 120)
    errs.age = 'Age must be a whole number between 0 and 120'

  if (!values.city.trim()) errs.city = 'City is required'
  if (!values.state.trim()) errs.state = 'State is required'

  const pin = values.pincode.trim()
  if (!pin) errs.pincode = 'Pincode is required'
  else if (pin.length < 4 || pin.length > 10) errs.pincode = 'Pincode must be 4–10 numbers'

  return errs
}

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate(form)
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    setSaving(true)
    setServerError('')
    try {
      const token = await getAccessTokenSilently()
      const url = isEdit
        ? `${import.meta.env.VITE_API_URL}/api/users/${id}`
        : `${import.meta.env.VITE_API_URL}/api/users`


      const response = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...form, age: Number(form.age) }),
      })

      if (!response.ok) {
        setServerError(`Save failed (${response.status})`)
        return
      }

      navigate('/')
    } catch (err) {
      setServerError(err.message)
    } finally {
      setSaving(false)
    }
  }


  useEffect(() => {
    if (!isEdit) return

    async function loadUser() {
      try {
        const token = await getAccessTokenSilently()
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!response.ok) {
          setServerError(`Could not load user (${response.status})`)
          return
        }
        const user = await response.json()
        setForm({
          name: user.name,
          age: String(user.age ?? ''),
          city: user.city,
          state: user.state,
          pincode: user.pincode,
        })
      } catch (err) {
        setServerError(err.message)
      }
    }
    loadUser()
  }, [id])

  return (
    <div className="container mt-4" style={{ maxWidth: 600 }}>
      <h1 className="mb-3">{isEdit ? 'Edit User' : 'Add User'}</h1>

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Name</label>
          <input className={`form-control ${errors.name? 'is-invalid':''}`} name="name" value={form.name} onChange={handleChange} />
                    {errors.name && <div className="invalid-feedback">{errors.name}</div>}
        </div>

        <div className="mb-3">
          <label className="form-label">Age</label>
          <input className={`form-control ${errors.age? 'is-invalid':''}`}  type="number" name="age" value={form.age} onChange={handleChange} />
                    {errors.age && <div className="invalid-feedback">{errors.age}</div>}

        </div>

        <div className="mb-3">
          <label className="form-label">City</label>
          <input className={`form-control ${errors.city? 'is-invalid':''}`}  name="city" value={form.city} onChange={handleChange} />
                    {errors.city && <div className="invalid-feedback">{errors.city}</div>}

        </div>

        <div className="mb-3">
          <label className="form-label">State</label>
          <input className={`form-control ${errors.state? 'is-invalid':''}`}  name="state" value={form.state} onChange={handleChange} />
                    {errors.state && <div className="invalid-feedback">{errors.state}</div>}

        </div>

        <div className="mb-3">
          <label className="form-label">Pincode</label>
          <input className={`form-control ${errors.pincode? 'is-invalid':''}`}  name="pincode" value={form.pincode} onChange={handleChange} />
                    {errors.pincode && <div className="invalid-feedback">{errors.pincode}</div>}

        </div>

        {serverError && <div className="alert alert-danger">{serverError}</div>}

        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Saving...' : 'Save'}
        </button>      </form>
    </div>
  )
}

export default AddUser
