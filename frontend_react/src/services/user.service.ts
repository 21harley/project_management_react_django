import axios from './../utils/axiosConfig';
import {  RegisterData, User } from '../types/auth.types';

const getUser = async (id: string): Promise<User> => {
    const response = await axios.get<User>(`usuarios/${id}/`);
    return response.data;
}

const getUsers = async (): Promise<Array<User>> => {
    const response = await axios.get<User[]>(`usuarios/`);
    return response.data;
}

const getMe = async (): Promise<User> => {
    const response = await axios.get<User>(`usuarios/me/`);
    return response.data;
}

const createUser = async (data: RegisterData): Promise<RegisterData> => {
    const response = await axios.post<RegisterData>(`usuarios/`, data);
    return response.data;
}

const updateUser = async (id: string, data: User): Promise<User> => {
    const response = await axios.put<User>(`usuarios/${id}/`, data);
    return response.data;
}

const deleteUser = async (id: string): Promise<void> => {
    await axios.delete(`usuarios/${id}/`);
}

export { getUser, getUsers, getMe, updateUser, deleteUser, createUser };