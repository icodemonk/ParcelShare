import { createContext, useContext, useState, useEffect } from "react";

export const AuthContext = createContext();
export const useAuthContext = () => useContext(AuthContext);

export function AuthProvider({ children }) {
    const [user, setUser] = useState({ token: null, role: null ,userid: null });

    useEffect(() => {
        const storedUser = localStorage.getItem('authUser');
        if (storedUser) {
            try {
                const userData = JSON.parse(storedUser);
                setUser({
                    token: userData.token,
                    role: userData.role,
                    userid: userData.userid,
                });
            } catch (error) {
                console.error('Error parsing stored user data:', error);
                localStorage.removeItem('authUser');
            }
        }
    }, []);

    const updateUser = (newUser) => {
        const userData = {
            token: newUser.token,
            role: newUser.role || 'user', // Default role
            userid: newUser.userid,
        };
        setUser(userData);
        localStorage.setItem('authUser', JSON.stringify(userData));
        localStorage.setItem('authToken', newUser.token);
        localStorage.setItem('userid', newUser.userid);
    };

    const removeUser = () => {
        setUser({ token: null, role: null ,userid: null });
        localStorage.removeItem('authUser');
        localStorage.removeItem('authToken');
        localStorage.removeItem('userid');
    };

    const isAuthenticated = () => {
        return !!user.token;
    };

    const getToken = () => {
        return user.token;
    };

    const getUserRole = () => {
        return user.role;
    };
    const getUserId =()=>{

        return user.userid;
    };

    return (
        <AuthContext.Provider value={{
            user,
            updateUser,
            removeUser,
            isAuthenticated,
            getToken,
            getUserRole,
            getUserId
        }}>
            {children}
        </AuthContext.Provider>
    );
}