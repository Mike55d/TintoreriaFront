/* eslint-disable import/no-anonymous-default-export */
import axios, { AxiosRequestConfig } from "axios";
import { saveAs } from "file-saver";

import { CTError } from "./utils/errors";

type MutationType = "post" | "put" | "patch" | "delete";

let authorizationToken = "";

axios.interceptors.request.use((config: any) => {
  if (authorizationToken && config.headers) {
    config.headers.Authorization = `Bearer ${authorizationToken}`;
  }
  return config;
});

const readUrl = (url = "") =>
  url.startsWith("http://") || url.startsWith("https://")
    ? url
    : `${process.env.NEXT_PUBLIC_SERVER}/${url}`;

export interface CancelRequestToken {
  cancel?: () => void;
}

function handleError(e: any): never {
  const { response } = e;
  if (response) {
    if (response.status === 503) {
      throw new CTError(503, "server_unavailable");
    }
    if (response.data) {
      throw new CTError(
        response.data.error,
        response.data.message,
        response.data.reason,
        response.data.field
      );
    }
    throw new CTError(503, "server_unavailable");
  }
  throw new CTError(999, "no_avilable");
}

// eslint-disable-next-line
const get = async (
  url = "",
  headers = {},
  params = {},
  config = {}
): Promise<any> => {
  try {
    const response = await axios.get(readUrl(url), {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...headers,
      },
      params,
      ...config,
    });
    return response;
  } catch (e) {
    handleError(e);
  }
};

const getFile = async (
  url = "",
  headers = {},
  params = {},
  config: any = {}
): Promise<any> => {
  try {
    const response = await axios.get(readUrl(url), {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...headers,
      },
      params,
      responseType: "blob",
      ...config,
    });
    let filename = response.headers["content-disposition"]
      ? response.headers["content-disposition"]
          .split("filename=")[1]
          .replaceAll('"', "")
      : null;
    saveAs(response.data, config.fileName || filename || "file");
  } catch (e) {
    handleError(e);
  }
};

const getFileUrl = async (url = "", headers = {}, params = {}, config = {}) => {
  try {
    const response = await axios.get(readUrl(url), {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...headers,
      },
      params,
      responseType: "blob",
      ...config,
    });

    const result = await new Promise((resolve) => {
      const reader = new window.FileReader();
      reader.readAsDataURL(response.data);
      reader.onload = () => resolve(reader.result);
    });

    return result as string;
  } catch (e) {
    handleError(e);
  }
};

const del = async (url = "", body = {}, headers = {}) => {
  try {
    const response = await axios.delete(readUrl(url), {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...headers,
      },
      data: {
        ...body,
      },
    });
    return response;
  } catch (e) {
    handleError(e);
  }
};

const mutate = async (
  mutation: MutationType,
  url = "",
  body = {},
  headers = {},
  files: File[] = []
) => {
  if (files.length) {
    const formData = new FormData();
    formData.append("payload", JSON.stringify(body));
    for (const file of files) {
      if (!file) {
        continue;
      }

      formData.append(file.name, file);
    }

    try {
      const response = await axios[mutation](readUrl(url), formData, {
        headers: {
          Accept: "application/json",
          "Content-Type": "multipart/form-data",
          ...headers,
        },
      });
      return response;
    } catch (e) {
      handleError(e);
    }
  } else {
    try {
      const response = await axios[mutation](readUrl(url), body, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          ...headers,
        },
      });
      return response;
    } catch (e) {
      handleError(e);
    }
  }
};

const setAuthorizationToken = (token: string) => {
  authorizationToken = token;
};

const getAuthorizationToken = () => {
  return authorizationToken;
};

const post = async (url = "", body = {}, headers = {}, files: File[] = []) =>
  mutate("post", url, body, headers, files);
const put = async (url = "", body = {}, headers = {}, files: File[] = []) =>
  mutate("put", url, body, headers, files);
const patch = async (url = "", body = {}, headers = {}, files: File[] = []) =>
  mutate("patch", url, body, headers, files);

export default {
  get,
  getFile,
  getFileUrl,
  post,
  put,
  patch,
  delete: del,
  setAuthorizationToken,
  getAuthorizationToken,
};
