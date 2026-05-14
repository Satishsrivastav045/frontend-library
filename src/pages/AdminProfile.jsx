import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../services/api';

const emptyForm = {
  name: '',
  email: '',
  mobileNumber: '',
  libraryAddress: '',
  profilePic: '',
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
};

const AdminProfile = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState('');

  useEffect(() => {
    let mounted = true;

    API.get('/admin/me')
      .then((res) => {
        if (!mounted) return;

        const admin = res.data?.data || {};
        setForm((current) => ({
          ...current,
          name: admin.name || '',
          email: admin.email || '',
          mobileNumber: admin.mobileNumber || '',
          libraryAddress: admin.libraryAddress || ''
        }));
        setPreview(admin.profilePic || '');
      })
      .catch((error) => {
        if (error.response?.status === 401) {
          navigate('/admin');
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [navigate]);

  const handleChange = (field) => (event) => {
    const { value } = event.target;
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || '');
      setForm((current) => ({ ...current, profilePic: dataUrl }));
      setPreview(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const submit = async (event) => {
    event.preventDefault();

    if (form.newPassword && form.newPassword !== form.confirmPassword) {
      return alert('New password and confirm password must match');
    }

    try {
      setSaving(true);

      await API.put('/admin/me', {
        name: form.name,
        email: form.email,
        mobileNumber: form.mobileNumber,
        libraryAddress: form.libraryAddress,
        ...(form.profilePic ? { profilePic: form.profilePic } : {}),
        currentPassword: form.currentPassword,
        newPassword: form.newPassword
      });

      alert('Admin profile updated');
      setForm((current) => ({
        ...current,
        profilePic: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
    } catch (error) {
      alert(error.response?.data?.message || 'Unable to update admin profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="admin-profile__loading">Loading admin profile...</div>;
  }

  return (
    <div className="admin-profile">
      <div className="admin-profile__header">
        <div>
          <h1>Admin Profile</h1>
          <p>Update contact details, password, profile photo, and library address.</p>
        </div>
        <Link to="/dashboard" className="admin-profile__back">
          Back to Dashboard
        </Link>
      </div>

      <div className="admin-profile__card">
        <div className="admin-profile__preview">
          {preview ? (
            <img src={preview} alt="Admin profile" />
          ) : (
            <div className="admin-profile__avatar">A</div>
          )}
          <label className="admin-profile__file">
            Upload Profile Pic
            <input type="file" accept="image/*" onChange={handleFile} />
          </label>
        </div>

        <form className="admin-profile__form" onSubmit={submit}>
          <div className="admin-profile__grid">
            <label>
              <span>Name</span>
              <input
                autoComplete="name"
                value={form.name}
                onChange={handleChange('name')}
              />
            </label>

            <label>
              <span>Email</span>
              <input
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={handleChange('email')}
              />
            </label>

            <label>
              <span>Mobile No.</span>
              <input
                type="text"
                autoComplete="tel"
                value={form.mobileNumber}
                onChange={handleChange('mobileNumber')}
              />
            </label>

            <label className="admin-profile__wide">
              <span>Library Address</span>
              <textarea
                rows="3"
                autoComplete="street-address"
                value={form.libraryAddress}
                onChange={handleChange('libraryAddress')}
              />
            </label>

            <label>
              <span>Current Password</span>
              <input
                type="password"
                autoComplete="current-password"
                value={form.currentPassword}
                onChange={handleChange('currentPassword')}
                placeholder="Required only for password change"
              />
            </label>

            <label>
              <span>New Password</span>
              <input
                type="password"
                autoComplete="new-password"
                value={form.newPassword}
                onChange={handleChange('newPassword')}
              />
            </label>

            <label>
              <span>Confirm Password</span>
              <input
                type="password"
                autoComplete="new-password"
                value={form.confirmPassword}
                onChange={handleChange('confirmPassword')}
              />
            </label>
          </div>

          <div className="admin-profile__actions">
            <button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminProfile;
