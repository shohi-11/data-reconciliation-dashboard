import React, { useState, useEffect } from "react";
import Papa from "papaparse";
import "../style/dashboard.css";

const SYSTEM_FIELDS = [
  { key: "transactionId", label: "Transaction ID", required: true },
  { key: "amount", label: "Amount", required: true },
  { key: "reference", label: "Reference Number", required: false },
  { key: "date", label: "Date", required: false },
];

/* =========================
   RESULT TABLE
========================= */
const ResultTable = ({ title, rows }) => {
  if (!rows || rows.length === 0) return null;

  const columns = Object.keys(rows[0]);

  return (
    <>
      <h4 style={{ marginTop: "20px" }}>{title}</h4>
      <table>
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c}>{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {columns.map((c) => (
                <td key={c}>{row[c]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};

const CSVupload = () => {
  const [headers, setHeaders] = useState([]);
  const [previewData, setPreviewData] = useState([]);
  const [mapping, setMapping] = useState({});
  const [errors, setErrors] = useState([]);
  const [data, setData] = useState([]);
  const [result, setResult] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);

  /* =========================
     AUDIT LOG
  ========================= */
  const addAuditLog = async (action, details, status = "SUCCESS") => {
    const log = { action, details, status };

    setAuditLogs((prev) => [
      { ...log, time: new Date().toLocaleString() },
      ...prev,
    ]);

    await fetch("http://localhost:5000/api/audit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(log),
    });
  };

  useEffect(() => {
    fetch("http://localhost:5000/api/audit")
      .then((res) => res.json())
      .then((data) => {
        setAuditLogs(
          data.map((log) => ({
            action: log.action,
            details: log.details,
            status: log.status,
            time: new Date(log.createdAt).toLocaleString(),
          }))
        );
      });
  }, []);

  /* =========================
     FILE UPLOAD
  ========================= */
  const handleFileUpload = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    Papa.parse(selectedFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (!results.data.length) {
          alert("CSV file is empty or invalid");
          return;
        }

        setHeaders(Object.keys(results.data[0]));
        setPreviewData(results.data.slice(0, 10));
        setData(results.data);
        setMapping({});
        setErrors([]);

        addAuditLog(
          "CSV Uploaded",
          `${selectedFile.name} (${results.data.length} rows)`
        );
      },
    });
  };

  /* =========================
     MAPPING
  ========================= */
  const handleMappingChange = (systemField, csvColumn) => {
    setMapping((prev) => ({
      ...prev,
      [systemField]: csvColumn,
    }));
  };

  const validateMapping = () => {
    let validationErrors = [];

    SYSTEM_FIELDS.forEach((field) => {
      if (field.required && !mapping[field.key]) {
        validationErrors.push(`${field.label} is required`);
      }
    });

    const selectedColumns = Object.values(mapping);
    const duplicates = selectedColumns.filter(
      (item, index) => selectedColumns.indexOf(item) !== index
    );

    if (duplicates.length > 0) {
      validationErrors.push("Same CSV column mapped multiple times");
    }

    setErrors(validationErrors);

    if (validationErrors.length === 0) {
      addAuditLog("Mapping Validated", "All required fields mapped");
    } else {
      addAuditLog(
        "Mapping Validation Failed",
        validationErrors.join(", "),
        "FAILED"
      );
    }
  };

  /* =========================
     RECONCILIATION
  ========================= */
  const reconcileData = async () => {
    if (errors.length > 0 || Object.keys(mapping).length === 0) {
      alert("Please validate mapping before reconciliation");
      return;
    }

    const res = await fetch("http://localhost:5000/api/reconcile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data, mapping }),
    });

    const response = await res.json();
    setResult(response);

    addAuditLog(
      "Reconciliation Executed",
      `Matched: ${response.matched.length}, Unmatched: ${response.unmatched.length}, Duplicates: ${response.duplicates.length}`
    );
  };

  return (
    <div className="container">
      <h3>Upload CSV File</h3>
      <input type="file" accept=".csv" onChange={handleFileUpload} />

      {headers.length > 0 && (
        <>
          <h3>Column Mapping</h3>

          {SYSTEM_FIELDS.map((field) => (
            <div className="mapping-row" key={field.key}>
              <label>
                {field.label}
                {field.required && " *"}
              </label>

              <select
                onChange={(e) =>
                  handleMappingChange(field.key, e.target.value)
                }
              >
                <option value="">Select column</option>
                {headers.map((col, i) => (
                  <option key={i} value={col}>
                    {col}
                  </option>
                ))}
              </select>
            </div>
          ))}

          <button onClick={validateMapping}>Validate Mapping</button>
        </>
      )}

      {errors.length > 0 && (
        <ul style={{ color: "red" }}>
          {errors.map((e, i) => (
            <li key={i}>{e}</li>
          ))}
        </ul>
      )}

      {previewData.length > 0 && (
        <>
          <h3>Preview</h3>
          <table>
            <thead>
              <tr>
                {headers.map((h, i) => (
                  <th key={i}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {previewData.map((row, i) => (
                <tr key={i}>
                  {headers.map((col, j) => (
                    <td key={j}>{row[col]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      <button
        onClick={reconcileData}
        disabled={errors.length > 0 || Object.keys(mapping).length === 0}
      >
        Reconcile Data
      </button>

      {/* =========================
        RESULT VIEW
      ========================= */}
      {result && (
        <>
          <h3>Reconciliation Result</h3>

          <div className="summary">
            <span className="badge success">
              Matched: {result.matched.length}
            </span>
            <span className="badge warning">
              Unmatched: {result.unmatched.length}
            </span>
            <span className="badge danger">
              Duplicates: {result.duplicates.length}
            </span>
          </div>

          <ResultTable title="Matched Records" rows={result.matched} />
          <ResultTable title="Unmatched Records" rows={result.unmatched} />
          <ResultTable title="Duplicate Records" rows={result.duplicates} />
        </>
      )}

      {auditLogs.length > 0 && (
        <>
          <h3>Audit Trail</h3>
          <table>
            <thead>
              <tr>
                <th>Time</th>
                <th>Action</th>
                <th>Details</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.map((log, i) => (
                <tr key={i}>
                  <td>{log.time}</td>
                  <td>{log.action}</td>
                  <td>{log.details}</td>
                  <td
                    style={{
                      color: log.status === "FAILED" ? "red" : "green",
                    }}
                  >
                    {log.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default CSVupload;
