import { API_URL } from "../../config.js";


export const createSchedule = async (data) => {
  let response = await fetch(`${API_URL}/api/schedule`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: data,
  });

  response = await response.json()
  // console.log("createSchedule", response );
  return response;
};

export const listScheduleDay = async (day) => {
  let response = await fetch(`${API_URL}/api/schedule/list-day/${day}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    }
  });

  response = await response.json()
  // console.log("listScheduleDay", response );
  return response;
};

// ADMIN

export const login = async (email, password) => {
  let response = await fetch(`${API_URL}/api/user/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({email: email, password: password}),
  });

  response = await response.json()
  // console.log("login", response );
  return response;
};

export const getAllSchedule = async () => {
  let response = await fetch(`${API_URL}/api/schedule/list-all`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    }
  });

  response = await response.json()
  // console.log("getAllSchedule", response );
  return response;
};

// SERVICES
export const getAllServices = async () => {
  let response = await fetch(`${API_URL}/api/service/list-all`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    }
  });

  response = await response.json()
  // console.log("getAllServices", response );
  return response;
};

export const createServices = async (name, value, duration) => {
  let response = await fetch(`${API_URL}/api/service`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({name, value, duration})
  });

  response = await response.json()
  // console.log("createServices", response );
  return response;
};

export const updateServices = async (id, data) => {
  let response = await fetch(`${API_URL}/api/service/${id}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data)
  });

  response = await response.json()
  // console.log("updateServices", response );
  return response;
};


export const deleteServices = async (id) => {
  let response = await fetch(`${API_URL}/api/service/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    }
  });

  response = await response.json()
  // console.log("deleteServices", response );
  return response;
};