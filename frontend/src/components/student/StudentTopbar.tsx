type Props = {
  showUserMenu: boolean;
  setShowUserMenu: (value: boolean) => void;
};

const StudentTopbar = ({
  showUserMenu,
  setShowUserMenu,
}: Props) => {
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
            <button className="student-user-menu-item">
              Profil
            </button>

            <button className="student-user-menu-item">
              Nastavitve
            </button>

            <button
              className="student-user-menu-item logout"
              onClick={() => {
                alert("Uspešno ste se odjavili.");
                setShowUserMenu(false);
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