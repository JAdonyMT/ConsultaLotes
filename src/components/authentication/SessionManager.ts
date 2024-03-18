export async function checkSession() {
    const AuthToken = sessionStorage.getItem("AuthToken");
    const ExpiresToken = sessionStorage.getItem("ExpiresToken");

    if (AuthToken && ExpiresToken) {
        const now = new Date();
        const expirationTime = new Date(ExpiresToken);

        if (now < expirationTime) {
            // console.log('Sesión válida');
            return true;
        } else {
            // console.log('Sesión expirada');
            logout();
            return false;
        }
    } else {
        // console.log('No hay sesión');
        return false;
    }
}

export function logout() {
    sessionStorage.removeItem("AuthToken");
    sessionStorage.removeItem("ExpiresToken");
    sessionStorage.removeItem("User");
    
    window.location.href = `/`;
}
