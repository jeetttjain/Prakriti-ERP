import React, { useEffect, useState } from "react";
import * as edpService from "../../services/enterpriseDataService";

export default function EnterpriseDataConsole() {
  const [activeTab, setActiveTab] = useState("files");
  const [files, setFiles] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [previewData, setPreviewData] = useState(null);

  const [uploadName, setUploadName] = useState("Invoice_2026_08.pdf");
  const [uploadModule, setUploadModule] = useState("Billing");
  const [uploadContent, setUploadContent] = useState("Invoice data sample content for EDP testing.");
  const [uploadMessage, setUploadMessage] = useState("");

  const [backupMessage, setBackupMessage] = useState("");

  const loadFiles = async () => {
    try {
      const res = await edpService.getFiles();
      setFiles(res.data || []);
    } catch (err) {
      console.error("Error loading EDP files:", err);
    }
  };

  useEffect(() => {
    loadFiles();
  }, []);

  const handleSearch = async () => {
    try {
      const res = await edpService.searchFiles(searchQuery);
      setSearchResults(res.data || res);
    } catch (err) {
      alert(`Search failed: ${err.message}`);
    }
  };

  const handlePreview = async (fileId) => {
    try {
      const res = await edpService.getPreview(fileId);
      setPreviewData(res.data || res);
    } catch (err) {
      alert(`Preview failed: ${err.message}`);
    }
  };

  const handleUpload = async () => {
    try {
      setUploadMessage("Uploading & calculating SHA-256 checksum...");
      const res = await edpService.uploadFile({
        filename: uploadName,
        originalName: uploadName,
        mimeType: uploadName.endsWith(".pdf") ? "application/pdf" : "text/plain",
        content: uploadContent,
        module: uploadModule,
        classification: "Confidential",
      });
      setUploadMessage(`✅ File registered in EDP! ID: ${res.data?.fileId} (Checksum: ${res.data?.checksum?.substr(0, 10)}...)`);
      loadFiles();
    } catch (err) {
      setUploadMessage(`❌ Upload failed: ${err.message}`);
    }
  };

  const handleCreateBackup = async () => {
    try {
      setBackupMessage("Generating full encrypted system backup manifest...");
      const res = await edpService.createBackup("ManualSystemBackup", "FULL");
      setBackupMessage(`✅ Backup created! Manifest ID: ${res.data?.backupId}`);
    } catch (err) {
      setBackupMessage(`❌ Backup error: ${err.message}`);
    }
  };

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "20px" }}>
      {/* Header */}
      <div style={{ marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "1.8rem", fontWeight: "800", margin: 0, color: "#0f172a" }}>Enterprise Data Platform (EDP)</h1>
          <p style={{ margin: "4px 0 0 0", color: "#64748b", fontSize: "0.9rem" }}>
            Unified data infrastructure, SHA-256 deduplication, version control, global search, and disaster recovery studio
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={handleCreateBackup} className="btn btn-secondary" style={{ fontWeight: "700" }}>
            📦 Run System Backup
          </button>
          <button onClick={loadFiles} className="btn btn-primary" style={{ fontWeight: "700" }}>
            🔄 Refresh Registry
          </button>
        </div>
      </div>

      {backupMessage && <div style={{ padding: "12px", background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#166534", borderRadius: "8px", marginBottom: "20px", fontWeight: "700" }}>{backupMessage}</div>}

      {/* Metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "16px", marginBottom: "24px" }}>
        <div style={{ background: "#fff", padding: "16px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
          <div style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase", fontWeight: "700" }}>Registered Files</div>
          <div style={{ fontSize: "1.7rem", fontWeight: "800", color: "#0f172a" }}>{files.length}</div>
        </div>
        <div style={{ background: "#fff", padding: "16px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
          <div style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase", fontWeight: "700" }}>Storage Tiers</div>
          <div style={{ fontSize: "1.7rem", fontWeight: "800", color: "#16a34a" }}>Hot / Cold</div>
        </div>
        <div style={{ background: "#fff", padding: "16px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
          <div style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase", fontWeight: "700" }}>Deduplication</div>
          <div style={{ fontSize: "1.7rem", fontWeight: "800", color: "#0284c7" }}>SHA-256</div>
        </div>
        <div style={{ background: "#fff", padding: "16px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
          <div style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase", fontWeight: "700" }}>Encryption</div>
          <div style={{ fontSize: "1.7rem", fontWeight: "800", color: "#7c3aed" }}>AES-256</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "2px solid #e2e8f0", marginBottom: "24px", overflowX: "auto" }}>
        {[
          { id: "files", label: "📁 File & Metadata Registry" },
          { id: "upload", label: "📤 Upload & Register File" },
          { id: "search", label: "🔍 Global Full-Text Search" },
          { id: "backup", label: "💾 Backup & Disaster Recovery" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: "10px 20px",
              border: "none",
              background: "none",
              fontWeight: 700,
              fontSize: "0.9rem",
              color: activeTab === tab.id ? "#16a34a" : "#64748b",
              borderBottom: activeTab === tab.id ? "3px solid #16a34a" : "3px solid transparent",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB: File Registry */}
      {activeTab === "files" && (
        <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "20px" }}>
          <h3 style={{ margin: "0 0 16px 0", fontSize: "1.05rem", fontWeight: "800" }}>Unified File Registry</h3>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>File ID</th>
                  <th>Original Name</th>
                  <th>Module</th>
                  <th>MIME Type</th>
                  <th>Classification</th>
                  <th>Version</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {files.map((f) => (
                  <tr key={f._id || f.fileId}>
                    <td style={{ fontWeight: "700", fontSize: "0.8rem" }}>{f.fileId}</td>
                    <td>{f.originalName}</td>
                    <td><span style={{ background: "#f1f5f9", padding: "2px 8px", borderRadius: "10px", fontSize: "0.75rem" }}>{f.module}</span></td>
                    <td style={{ fontSize: "0.8rem" }}>{f.mimeType}</td>
                    <td><span style={{ background: "#fef3c7", color: "#b45309", padding: "2px 8px", borderRadius: "10px", fontSize: "0.75rem", fontWeight: "700" }}>{f.securityClassification || "Internal"}</span></td>
                    <td>v{f.version || 1}</td>
                    <td>
                      <button onClick={() => handlePreview(f.fileId)} className="btn btn-secondary" style={{ fontSize: "0.75rem", padding: "4px 8px" }}>
                        Preview
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {previewData && (
            <div style={{ marginTop: "24px", padding: "16px", background: "#f8fafc", borderRadius: "10px", border: "1px solid #cbd5e1" }}>
              <h4 style={{ margin: "0 0 10px 0" }}>In-Browser Preview ({previewData.originalName})</h4>
              <div dangerouslySetInnerHTML={{ __html: previewData.htmlPreview }} />
            </div>
          )}
        </div>
      )}

      {/* TAB: Upload File */}
      {activeTab === "upload" && (
        <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "24px", maxWidth: "600px" }}>
          <h3 style={{ margin: "0 0 16px 0", fontSize: "1.05rem", fontWeight: "800" }}>Upload & Register File in EDP</h3>
          
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", marginBottom: "6px" }}>Filename</label>
            <input type="text" value={uploadName} onChange={(e) => setUploadName(e.target.value)} style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1" }} />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", marginBottom: "6px" }}>Target Module</label>
            <select value={uploadModule} onChange={(e) => setUploadModule(e.target.value)} style={{ width: "100%", padding: "8px 12px", borderRadius: "6px" }}>
              <option value="Billing">Billing</option>
              <option value="Orders">Orders</option>
              <option value="Purchases">Purchases</option>
              <option value="Reports">Reports</option>
              <option value="Media">Media</option>
            </select>
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", marginBottom: "6px" }}>File Content / Payload</label>
            <textarea rows={4} value={uploadContent} onChange={(e) => setUploadContent(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1" }} />
          </div>

          <button onClick={handleUpload} className="btn btn-primary" style={{ width: "100%", fontWeight: "700" }}>
            📤 Upload File to Storage Manager
          </button>

          {uploadMessage && <div style={{ marginTop: "16px", padding: "12px", background: "#f8fafc", borderRadius: "8px", fontSize: "0.85rem", fontWeight: "700" }}>{uploadMessage}</div>}
        </div>
      )}

      {/* TAB: Global Search */}
      {activeTab === "search" && (
        <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "24px" }}>
          <h3 style={{ margin: "0 0 16px 0", fontSize: "1.05rem", fontWeight: "800" }}>Global Full-Text Search Probe</h3>

          <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
            <input type="text" placeholder="Search filenames, modules, tags, metadata..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ flex: 1, padding: "10px 14px", borderRadius: "6px", border: "1px solid #cbd5e1" }} />
            <button onClick={handleSearch} className="btn btn-primary" style={{ fontWeight: "700" }}>🔍 Search</button>
          </div>

          {searchResults && (
            <div>
              <div style={{ fontSize: "0.9rem", color: "#64748b", marginBottom: "12px" }}>Found {searchResults.totalMatches} file match(es) for "{searchResults.queryText}"</div>
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>File ID</th>
                      <th>Filename</th>
                      <th>Module</th>
                      <th>Classification</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(searchResults.files || []).map((f) => (
                      <tr key={f._id}>
                        <td>{f.fileId}</td>
                        <td>{f.originalName}</td>
                        <td>{f.module}</td>
                        <td>{f.securityClassification}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
