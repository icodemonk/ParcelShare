
import axios  from "axios";
// import {useState} from "react";
const BASE_URL='http://localhost:8080';


// test api

export const testApi = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/api/auth/react`);
        return response.data;
    } catch (error) {
        console.error(error);
        return null;
    }
};

export const login=async (user)=>{
    try {
        const response = await axios.post(`${BASE_URL}/api/auth/login`, user);
        return response.data;
    }
    catch (error) {
        console.error(error);
        return null;
    }

}


