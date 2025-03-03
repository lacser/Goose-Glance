import { useEffect, useState, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  setJobDescription,
  setJobSummary,
} from "../store/slices/waterlooworksSlice";

const DB_NAME = "gooseGlanceDB";
const DB_VERSION = 1;
const JOB_STORE_NAME = "waterlooworksJobData";

export const useIndexedDB = () => {
  const dispatch = useAppDispatch();
  const jobData = useAppSelector((state) => state.waterlooworks.jobData);
  const [db, setDb] = useState<IDBDatabase | null>(null);

  // Load job data from IndexedDB to Redux store
  const loadJobData = useCallback(
    (database: IDBDatabase) => {
      const transaction = database.transaction([JOB_STORE_NAME], "readonly");
      const store = transaction.objectStore(JOB_STORE_NAME);
      const request = store.get("jobData");

      request.onsuccess = () => {
        const storedJobData = request.result;

        if (storedJobData) {
          Object.keys(storedJobData).forEach((id) => {
            if (storedJobData[id].description) {
              dispatch(
                setJobDescription({
                  id,
                  description: storedJobData[id].description,
                })
              );
            }
            if (storedJobData[id].summary) {
              dispatch(
                setJobSummary({
                  id,
                  summary: storedJobData[id].summary,
                })
              );
            }
          });
        }
      };

      request.onerror = (event) => {
        console.error("Error loading job data from IndexedDB:", event);
      };
    },
    [dispatch]
  );

  // Save job data to IndexedDB
  const saveJobData = useCallback(
    (data: JobDataType) => {
      if (!db) return;

      const transaction = db.transaction([JOB_STORE_NAME], "readwrite");
      const store = transaction.objectStore(JOB_STORE_NAME);
      const request = store.put(data, "jobData");

      request.onerror = (event) => {
        console.error("Error saving job data to IndexedDB:", event);
      };
    },
    [db]
  );

  useEffect(() => {
    const initDB = async () => {
      return new Promise<IDBDatabase>((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = (event) => {
          console.error("IndexedDB error:", event);
          reject("Error opening IndexedDB");
        };

        request.onsuccess = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          resolve(db);
        };

        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          if (!db.objectStoreNames.contains(JOB_STORE_NAME)) {
            db.createObjectStore(JOB_STORE_NAME);
          }
        };
      });
    };

    let database: IDBDatabase | null = null;
    const setupDB = async () => {
      try {
        database = await initDB();
        setDb(database);
        loadJobData(database);
      } catch (error) {
        console.error("Failed to initialize IndexedDB:", error);
      }
    };
    setupDB();

    return () => {
      if (database) {
        database.close();
      }
    };
  }, [loadJobData]);

  // Save job data to IndexedDB when Redux state changes
  useEffect(() => {
    if (db && Object.keys(jobData).length > 0) {
        console.log("Saving job data to IndexedDB:", jobData);
        saveJobData(jobData);
    }
  }, [db, jobData, saveJobData]);

  type JobDataType = {
    [id: string]: {
      description?: string;
      summary?: string;
    };
  };

  return { db };
};
