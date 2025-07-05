
import { useState, useEffect } from "react";

export interface Report {
    id: string;
    title: string;
    content: string;
    date: string;
}

export function useReports() {
    const [reports, setReports] = useState<Report[]>([]);

    useEffect(() => {
        const saved = localStorage.getItem("reports");
        if (saved) setReports(JSON.parse(saved));
    }, []);

    const saveReports = (newReports: Report[]) => {
        setReports(newReports);
        localStorage.setItem("reports", JSON.stringify(newReports));
    };

    const removeReport = (id: string) => {
        const filtered = reports.filter((r) => r.id !== id);
        saveReports(filtered);
    };

    const clearAll = () => {
        saveReports([]);
    };

    return { reports, setReports: saveReports, removeReport, clearAll };
}
