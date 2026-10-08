# BuildSafe-AI · System Testing & Input Guide
**IT3051 Fundamentals of Data Mining · Mini Project 2026**

This document details the exact inputs and steps to test every feature of the BuildSafe-AI web application.

> **PDF Version:** You can open [`BuildSafe_Testing_Guide.html`](file:///d:/FDM%20Pro/BuildSafe-AI/BuildSafe_Testing_Guide.html) in your browser and click **"Print / Save as PDF"** (or press `Ctrl + P`) to export this entire guide as a formatted PDF.

---

## 1. How to Launch the Application

### Method A: 1-Click Windows Launcher
Double-click [`start_all.bat`](file:///d:/FDM%20Pro/BuildSafe-AI/start_all.bat) in the project directory.

### Method B: Cross-Platform Python Launcher
Run in PowerShell / Terminal:
```powershell
python start_app.py
```

### Method C: Manual Startup
* **Terminal 1 (FastAPI Backend):**
  ```powershell
  python backend/run.py
  ```
  *Backend runs at `http://127.0.0.1:8000` (Swagger docs at `/docs`)*
* **Terminal 2 (React Vite Frontend):**
  ```powershell
  cd frontend
  npm run dev
  ```
  *Frontend runs at `http://localhost:5173`*

---

## 2. Test Scenarios (Exact Values to Input)

Navigate to the **"Predict Severity"** tab on `http://localhost:5173`:

### 🔴 Test Scenario 1: Immediately Hazardous (Class 1)
* **Goal:** Verify that structural hazards trigger Class 1 triage with high confidence.
* **Input Values:**
  * **Violation Description:**
    ```
    UNLAWFUL ACTS. FAILURE TO COMPLY WITH COMMISSIONER'S ORDER. FAILURE TO MAINTAIN BUILDING STABILITY DURING DEMOLITION WORK. CRACKING AND BULGING OBSERVED ON EXTERIOR BEARING WALL. CEASE USE AND PROVIDE IMMEDIATE SHORING.
    ```
  * **Borough:** `1 - Manhattan`
  * **Violation Type:** `Construction`
  * **Respondent Name:** `METROPOLITAN BUILDERS CORP`
  * **Issue Date:** `2026-06-18`
  * **Aggravation Level:** `Aggravated Offense Level 1`
  * **Building ID (BIN):** `1000007` *(Click "Check History" to verify 10 prior violations)*
* **Expected Result:**
  * **Predicted Class:** `CLASS - 1: Immediately hazardous`
  * **Confidence:** `~99.9%`
  * **Human Inspector Flag:** `False` (Automated Dispatch Approved ✅)

---

### 🔵 Test Scenario 2: Major Violation (Class 2)
* **Goal:** Verify standard unpermitted structural alterations and occupancy changes.
* **Input Values:**
  * **Violation Description:**
    ```
    WORK WITHOUT A PERMIT. NOTED RESIDENTIAL 2ND FLOOR APARTMENT CONVERTED INTO COMMERCIAL SPA BUSINESS MABEL SPA LLC WITH NEW PARTITIONS AND PLUMBING FIXTURES WITHOUT VALID DOB APPROVAL.
    ```
  * **Borough:** `2 - Bronx`
  * **Violation Type:** `Construction`
  * **Respondent Name:** `ZAPATA NEPTALI`
  * **Issue Date:** `2026-06-01`
  * **Aggravation Level:** `No Aggravation (Standard)`
  * **Building ID (BIN):** `2026562`
* **Expected Result:**
  * **Predicted Class:** `CLASS - 2: Major`
  * **Confidence:** `~82.0% - 90.0%`
  * **Human Inspector Flag:** `False` (Automated Dispatch Approved ✅)

---

### 🟡 Test Scenario 3: Lesser Violation (Class 3)
* **Goal:** Verify cosmetic and minor administrative non-hazardous infractions.
* **Input Values:**
  * **Violation Description:**
    ```
    OUTDOOR ADVERTISING SIGN DISPLAYED WITHOUT VALID CERTIFICATE OF REGISTRATION. MAINTAINING ILLUMINATED SIGN EXCEEDING ALLOWABLE SQUARE FOOTAGE ON ROOF. FILE CERTIFICATE AND ALL PERMITS WITH COMMISSIONER.
    ```
  * **Borough:** `4 - Queens`
  * **Violation Type:** `Signs`
  * **Respondent Name:** `CLEAR CHANNEL OUTDOOR INC`
  * **Issue Date:** `2026-05-20`
  * **Aggravation Level:** `No Aggravation (Standard)`
  * **Building ID (BIN):** `4001234`
* **Expected Result:**
  * **Predicted Class:** `CLASS - 3: Lesser`
  * **Confidence:** `~74.0% - 85.0%`
  * **Human Inspector Flag:** `False` (Automated Dispatch Approved ✅)

---

### ⚠️ Test Scenario 4: Ambiguous Borderline Case (Human Inspector Flag)
* **Goal:** Verify that uncertain predictions ($< 65.0\%$ confidence) are blocked from autonomous dispatch and escalated to a human inspector.
* **Input Values:**
  * **Violation Description:**
    ```
    FAILURE TO MAINTAIN EXTERIOR BUILDING WALL REPAIR CRACK
    ```
  * **Borough:** `1 - Manhattan`
  * **Violation Type:** `Construction`
  * **Respondent Name:** `NYC HOUSING AUTHORITY`
  * **Issue Date:** `2026-06-15`
  * **Aggravation Level:** `No Aggravation (Standard)`
  * **Building ID (BIN):** `1000007`
* **Expected Result:**
  * **Predicted Class:** `CLASS - 2: Major`
  * **Confidence:** **`54.2%`** *(Below 65.0% Safety Cutoff)*
  * **Probabilities Breakdown:** Class 1: `44.2%` | Class 2: `54.2%` | Class 3: `1.6%`
  * **Human Review Flag:** **`TRUE`**
  * **UI Alert Banner:**
    > **⚠️ SEND TO HUMAN INSPECTOR — QUALITY ASSURANCE REVIEW REQUIRED**  
    > *Confidence score (54.2%) is below the quality assurance threshold of 65.0%. High ambiguity detected between classes. Mandatory on-site review required.*

---

## 3. Interactive UI Features to Test

1. **Light & Dark Theme Switcher:**
   * Click the **"Light Mode" / "Dark Mode"** toggle button in the top-right header or bottom of the sidebar.
   * Verify all cards, inputs, charts, and text adapt smoothly between deep dark navy and bright crisp white.
2. **Quick Scenario Presets:**
   * Click any of the 4 preset cards at the top of the form (*"Severe Structural Hazard"*, *"Illegal Occupancy"*, *"Expired Signage"*, *"Borderline Triage"*).
   * Verify all 7 fields autofill instantly.
3. **Live Respondent Categorization:**
   * Type `NYC HOUSING AUTHORITY` in the Respondent field: The badge updates in real-time to `Derived: GOVERNMENT`.
   * Type `ABC CORP LLC`: Badge updates to `Derived: ORGANISATION`.
4. **Building History Live Lookup:**
   * Enter `1000007` in the Building ID field and click **"Check History"**.
   * The backend queries `artifacts/bin_history_lookup.csv` and returns:
     `Total Priors: 10 | Class 1 Priors: 7 | Last: 2026-09-02`.
5. **Feature Engineering Transparency Drawer:**
   * After submitting a prediction, expand the **"Inspect Engineered Model Inputs (14 Features)"** drawer.
   * View the preprocessed text (with masked leakage words), month, day of week, weekend indicator, and building priors.
6. **Batch CSV Triage:**
   * Click **"Batch Triage"** in the top navigation bar.
   * Click **"Load Demo 5-Case Batch"** to triage 5 records at once.
   * Click the filter buttons: `All`, `⚠️ Human Review`, `Class 1`, `Class 2`, `Class 3`.
   * Click **"Export Triage Report (CSV)"** to download the results.
7. **Model Audit Tab:**
   * Click **"Model Audit"** to view the candidate comparison table from Stage 7 showing why Logistic Regression won the pre-declared selection rule over SVM, Random Forest, LightGBM, and XGBoost.
