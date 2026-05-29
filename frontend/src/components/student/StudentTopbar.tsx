import { useAuth } from "../../context/AuthContext";

type Props = {
  showUserMenu: boolean;
  setShowUserMenu: (value: boolean) => void;
};

const StudentTopbar = ({ showUserMenu, setShowUserMenu }: Props) => {
  const { logout } = useAuth();

  return (
    <div className="student-topbar">
      <div className="student-user-wrapper">
        <button
          className="student-user-avatar-only"
          onClick={() => setShowUserMenu(!showUserMenu)}
        >
          KM
        </button>
        {showUserMenu && (
          <div className="student-user-menu">
            <button className="student-user-menu-item">Profil</button>
            <button className="student-user-menu-item">Nastavitve</button>
            <button
              className="student-user-menu-item logout"
              onClick={() => {
                setShowUserMenu(false);
                logout();
              }}
            >
              Odjava
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentTopbar;