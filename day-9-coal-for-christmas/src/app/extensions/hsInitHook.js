import { useEffect, useRef, useState } from "react";

// Toggle this to make it work for QA accounts
const IS_QA = true;

export const INIT_STATUSES = {
  PENDING: "PENDING",
  SUCCESS: "SUCCESS",
  FAILED: "FAILED",
};

export const useHSInit = (runServerless, initData = {}) => {
  const data = useRef(initData);
  const [initStatus, setInitStatus] = useState({
    status: INIT_STATUSES.PENDING,
    error: null,
    data: null,
  });

  useEffect(() => {
    runServerless({
      name: "hsInit",
      parameters: { data: data.current, qa: IS_QA },
    }).then(processResponse);
  }, [data.current]);

  const processResponse = ({ message, response }) => {
    const newStatus = { ...initStatus };

    if (response.data) {
      newStatus.data = response.data;
    }

    if (response && response.status === "SUCCESS") {
      newStatus.status = INIT_STATUSES.SUCCESS;
    } else {
      newStatus.status = INIT_STATUSES.FAILED;

      if (response.error) {
        if (typeof response.error === "string") {
          newStatus.error = response.error;
        } else {
          newStatus.error = response.error.message;
        }
      } else if (message) {
        newStatus.message = message;
      }
    }

    setInitStatus(newStatus);
  };

  return initStatus;
};
