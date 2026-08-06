import { useState, useCallback } from "react";
import { generateTempId } from "../../utils/helpers";
import { formatPhone } from "../../utils/phoneUtils";
import FormError from "../common/FormError";

/**
 * Handles adding, removing, and modifying branch outlets for a B2B Customer.
 * Supports separate Contact Number and WhatsApp Number.
 * @component
 * @param {Object} props Props
 * @param {Array} props.branches Array of active branch objects
 * @param {string} props.mainMobile Mobile number of the primary customer profile
 * @param {Function} props.onChangeBranches Callback triggered on list changes
 */
export default function CustomerBranchSection({ branches, mainMobile, onChangeBranches }) {
  const [editingBranchId, setEditingBranchId] = useState(null);
  const [isSameNumber, setIsSameNumber] = useState(true);
  
  const [branchForm, setBranchForm] = useState({
    branchName: "",
    personName: "",
    contactNumber: "",
    whatsappNumber: "",
    mobile: "", // kept for DB backward compatibility
    address: "",
    status: "Active"
  });

  const [branchErrors, setBranchErrors] = useState({});

  const validateBranch = useCallback(() => {
    const errors = {};
    if (!branchForm.branchName || branchForm.branchName.trim() === "") {
      errors.branchName = "Branch name is required.";
    } else {
      const isDuplicateName = branches.some(
        (b) =>
          b.branchName.trim().toLowerCase() === branchForm.branchName.trim().toLowerCase() &&
          b._id !== editingBranchId
      );
      if (isDuplicateName) {
        errors.branchName = "A branch with this name is already configured.";
      }
    }

    if (!branchForm.personName || branchForm.personName.trim() === "") {
      errors.personName = "Contact person is required.";
    }

    // Validate Contact Number
    if (!branchForm.contactNumber || !/^[0-9]{10}$/.test(branchForm.contactNumber)) {
      errors.contactNumber = "Please enter a valid 10-digit contact number.";
    } else {
      if (branchForm.contactNumber === mainMobile) {
        errors.contactNumber = "Branch contact mobile cannot match main customer contact.";
      }
      const isDuplicateContact = branches.some(
        (b) => b.contactNumber === branchForm.contactNumber && b._id !== editingBranchId
      );
      if (isDuplicateContact) {
        errors.contactNumber = "This contact number is already allocated to another branch.";
      }
    }

    // Validate WhatsApp Number
    if (!branchForm.whatsappNumber || !/^[0-9]{10}$/.test(branchForm.whatsappNumber)) {
      errors.whatsappNumber = "Please enter a valid 10-digit WhatsApp number.";
    }

    if (!branchForm.address || branchForm.address.trim() === "") {
      errors.address = "Branch address is required.";
    }

    setBranchErrors(errors);
    return Object.keys(errors).length === 0;
  }, [branchForm, branches, mainMobile, editingBranchId]);

  const handleContactInput = useCallback((e) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 10);
    setBranchForm((prev) => ({
      ...prev,
      contactNumber: val,
      whatsappNumber: isSameNumber ? val : prev.whatsappNumber
    }));
  }, [isSameNumber]);

  const handleWhatsappInput = useCallback((e) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 10);
    setBranchForm((prev) => ({ ...prev, whatsappNumber: val }));
  }, []);

  const handleContactPaste = useCallback((e) => {
    e.preventDefault();
    const paste = e.clipboardData.getData("text");
    const val = paste.replace(/\D/g, "").slice(0, 10);
    setBranchForm((prev) => ({
      ...prev,
      contactNumber: val,
      whatsappNumber: isSameNumber ? val : prev.whatsappNumber
    }));
  }, [isSameNumber]);

  const handleWhatsappPaste = useCallback((e) => {
    e.preventDefault();
    const paste = e.clipboardData.getData("text");
    const val = paste.replace(/\D/g, "").slice(0, 10);
    setBranchForm((prev) => ({ ...prev, whatsappNumber: val }));
  }, []);

  const handleCheckboxChange = useCallback((e) => {
    const checked = e.target.checked;
    setIsSameNumber(checked);
    if (checked) {
      setBranchForm((prev) => ({ ...prev, whatsappNumber: prev.contactNumber }));
    }
  }, []);

  const handleSaveBranch = () => {
    if (!validateBranch()) return;

    const finalBranch = {
      ...branchForm,
      mobile: branchForm.contactNumber // DB sync
    };

    if (editingBranchId) {
      const updatedList = branches.map((b) =>
        b._id === editingBranchId ? { ...finalBranch, _id: editingBranchId } : b
      );
      onChangeBranches(updatedList);
      setEditingBranchId(null);
    } else {
      const newBranch = { ...finalBranch, _id: generateTempId() };
      onChangeBranches([...branches, newBranch]);
    }

    // Reset local state
    setBranchForm({ branchName: "", personName: "", contactNumber: "", whatsappNumber: "", mobile: "", address: "", status: "Active" });
    setIsSameNumber(true);
    setBranchErrors({});
  };

  const handleEditClick = (branch) => {
    setEditingBranchId(branch._id);
    const branchContact = branch.contactNumber || branch.mobile || "";
    const branchWhatsapp = branch.whatsappNumber || branch.mobile || "";
    
    setBranchForm({
      branchName: branch.branchName || "",
      personName: branch.personName || "",
      contactNumber: branchContact,
      whatsappNumber: branchWhatsapp,
      mobile: branch.mobile || "",
      address: branch.address || "",
      status: branch.status || "Active"
    });
    
    setIsSameNumber(branchContact === branchWhatsapp);
    setBranchErrors({});
  };

  const handleRemoveClick = (id) => {
    const filteredList = branches.filter((b) => b._id !== id);
    onChangeBranches(filteredList);
    if (editingBranchId === id) {
      setEditingBranchId(null);
      setBranchForm({ branchName: "", personName: "", contactNumber: "", whatsappNumber: "", mobile: "", address: "", status: "Active" });
      setIsSameNumber(true);
    }
  };

  const handleCancelEdit = () => {
    setEditingBranchId(null);
    setBranchForm({ branchName: "", personName: "", contactNumber: "", whatsappNumber: "", mobile: "", address: "", status: "Active" });
    setIsSameNumber(true);
    setBranchErrors({});
  };

  return (
    <div className="branch-section-wrap">
      <h4 style={{ fontSize: "0.9rem", fontWeight: "600", marginBottom: "12px", color: "var(--text-main)" }}>
        Branch Outlets ({branches.length})
      </h4>

      {branches.map((b) => (
        <div key={b._id} className="branch-item-card">
          <div>
            <strong>{b.branchName}</strong> ({b.personName}) <br />
            <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
              Call: {formatPhone(b.contactNumber || b.mobile)} | WhatsApp: {formatPhone(b.whatsappNumber || b.contactNumber || b.mobile)} <br />
              Address: {b.address}
            </span>
          </div>
          <div>
            <button
              type="button"
              className="btn-inline-edit"
              onClick={() => handleEditClick(b)}
              aria-label={`Edit ${b.branchName}`}
            >
              Edit
            </button>
            <button
              type="button"
              className="btn-inline-remove"
              onClick={() => handleRemoveClick(b._id)}
              aria-label={`Remove ${b.branchName}`}
            >
              Remove
            </button>
          </div>
        </div>
      ))}

      <div className="branch-editor-container" style={{ marginTop: "12px" }}>
        <h5 style={{ fontSize: "0.85rem", color: "var(--primary)", fontWeight: "600", marginBottom: "10px" }}>
          {editingBranchId ? "Modify Branch Node" : "Append New Branch"}
        </h5>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <div>
            <input
              type="text"
              className="form-input"
              style={{ padding: "6px 10px", fontSize: "0.85rem" }}
              placeholder="Branch Name (e.g. West Delhi)"
              value={branchForm.branchName}
              onChange={(e) => setBranchForm({ ...branchForm, branchName: e.target.value })}
              aria-label="Branch Outlet Name"
              required
            />
            <FormError error={branchErrors.branchName} />
          </div>

          <div>
            <input
              type="text"
              className="form-input"
              style={{ padding: "6px 10px", fontSize: "0.85rem" }}
              placeholder="Contact Person"
              value={branchForm.personName}
              onChange={(e) => setBranchForm({ ...branchForm, personName: e.target.value })}
              aria-label="Branch Contact Person"
              required
            />
            <FormError error={branchErrors.personName} />
          </div>

          <div>
            <input
              type="text"
              className="form-input"
              style={{ padding: "6px 10px", fontSize: "0.85rem" }}
              placeholder="Contact Number (10 digits)"
              value={branchForm.contactNumber}
              onChange={handleContactInput}
              onPaste={handleContactPaste}
              maxLength={10}
              inputMode="numeric"
              aria-label="Branch Contact Number"
              required
            />
            <FormError error={branchErrors.contactNumber} />
          </div>

          <div>
            <input
              type="text"
              className="form-input"
              style={{ padding: "6px 10px", fontSize: "0.85rem" }}
              placeholder="WhatsApp Number (10 digits)"
              value={branchForm.whatsappNumber}
              onChange={handleWhatsappInput}
              onPaste={handleWhatsappPaste}
              maxLength={10}
              disabled={isSameNumber}
              inputMode="numeric"
              aria-label="Branch WhatsApp Number"
              required
            />
            <FormError error={branchErrors.whatsappNumber} />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
            <input
              type="checkbox"
              id="chk-branch-same-number"
              checked={isSameNumber}
              onChange={handleCheckboxChange}
            />
            <label htmlFor="chk-branch-same-number" style={{ fontSize: "0.8rem", cursor: "pointer", fontWeight: "500" }}>
              Same as Contact Number
            </label>
          </div>

          <div>
            <input
              type="text"
              className="form-input"
              style={{ padding: "6px 10px", fontSize: "0.85rem" }}
              placeholder="Branch Physical Address"
              value={branchForm.address}
              onChange={(e) => setBranchForm({ ...branchForm, address: e.target.value })}
              aria-label="Branch Physical Address"
              required
            />
            <FormError error={branchErrors.address} />
          </div>

          <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleSaveBranch}
              aria-label={editingBranchId ? "Save branch modifications" : "Insert new branch outlet"}
            >
              {editingBranchId ? "Update Branch" : "Insert Branch"}
            </button>
            {editingBranchId && (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleCancelEdit}
                aria-label="Cancel modifications"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
