Of course. Here is the feature specification for the "Baby Shark" phase in Markdown format:

### **Feature Specification: Phase 2 - "Baby Shark"**

**Document Version:** 1.0
**Date:** July 31, 2025
**Phase Objective:** To implement the minimum necessary backend functionality to make the "Ugly Duckling" UI interactive and create the first version of the product that can be tested by users. This phase focuses on core data handling, context persistence, and a basic, context-aware chat interface, explicitly excluding any advanced backend data processing (e.g., Pandas).

---

### **1. Feature: Data Upload & Processing (Data Studio)**

#### **1.1. Objective**

To provide a robust and functional interface for users to upload and manage their data files within a project. This includes fixing the previously identified CSV encoding bug by moving all parsing logic to the backend.

#### **1.2. Functional Requirements**

- **FR-1.1 (File Upload):** The system must allow users to upload files via a drag-and-drop interface or a standard file browser selection.
- **FR-1.2 (File Type Validation):** For this phase, the system will only accept files with a `.csv` extension. An informative error message will be displayed for any other file type.
- **FR-1.3 (Backend Processing):** Upon upload, the file must be sent to the backend. The backend is responsible for:
  - Detecting the file's character encoding (e.g., UTF-8, ISO-8859-1).
  - Parsing the CSV content to validate its structure.
  - Storing the file in the designated storage solution.
  - Saving the file's metadata (name, size, type, upload date, project association) to the database.
- **FR-1.4 (File List Display):** The "Data Studio" tab must display a list of all files successfully uploaded and associated with the current project.
- **FR-1.5 (File Deletion):** Users must be able to delete an uploaded file. This action will remove the file from storage and its metadata from the database.
- **FR-1.6 (Data Preview):** Users must be able to preview the contents of an uploaded CSV file in a modal window. The backend will provide a JSON representation of the first N rows (e.g., N=100) of the parsed file for this preview.

#### **1.3. User Flow: Uploading and Managing Data**

1.  **Pre-condition:** The user is logged in and has selected a project. They are viewing the "Data Studio" tab.
2.  The user sees an empty file list and a file upload zone.
3.  The user drags a CSV file (`sales_data.csv`) onto the upload zone.
4.  The frontend initiates an API call to upload the file to the backend. A loading indicator is displayed for the file.
5.  The backend receives the file, correctly identifies its encoding, parses it, and saves it. It returns a success response.
6.  The loading indicator disappears, and `sales_data.csv` appears in the file list with its metadata.
7.  The user clicks the "Preview" button for `sales_data.csv`.
8.  The frontend requests the preview data from the backend.
9.  A modal opens, displaying the first 100 rows of the CSV in a clean, readable table.
10. The user closes the modal.
11. The user clicks the "Delete" button for the file. A confirmation prompt appears.
12. The user confirms the deletion. The file is removed from the list and deleted from the backend.

---

### **2. Feature: Context Definition**

#### **2.1. Objective**

To allow users to add and persist a simple, plain-text description of their project's context. This context is critical for enhancing the quality of AI responses in the Chat feature.

#### **2.2. Functional Requirements**

- **FR-2.1 (Display Context):** When the "Context" tab is opened, the system must fetch and display the currently saved context for the active project in a text area.
- **FR-2.2 (Edit Context):** The user must be able to type and edit text within the context text area.
- **FR-2.3 (Save Context):** A "Save" button must be present. When clicked, the frontend will send the contents of the text area to the backend.
- **FR-2.4 (Persistence):** The backend must save the received text and associate it with the current project ID in the database, overwriting any previously saved context.
- **FR-2.5 (Save Confirmation):** Upon successful save, a clear but unobtrusive confirmation message (e.g., "Context saved!") should be displayed to the user.

#### **2.3. User Flow: Defining Project Context**

1.  **Pre-condition:** The user is logged in and has selected a project.
2.  The user navigates to the "Context" tab. The text area is empty.
3.  The user types in a description: "This project analyzes daily sales data for my e-commerce store. The file 'sales_data.csv' contains columns for 'QTY' (quantity sold) and 'SKU' (product identifier)."
4.  The user clicks the "Save" button.
5.  The frontend sends the text to the backend. A "Saved!" confirmation appears briefly.
6.  The user navigates away to the "Chat" tab and then returns to the "Context" tab.
7.  The text area is populated with the previously saved description.

---

### **3. Feature: Conversational Analysis (Chat)**

#### **3.1. Objective**

To provide a functional chat interface where users can interact with an LLM. The system must automatically prepend the saved project context to the user's prompts to provide more relevant, context-aware responses.

#### **3.2. Functional Requirements**

- **FR-3.1 (Display Chat History):** The system should display the conversation history for the current session. For this phase, chat history does not need to be persisted between sessions.
- **FR-3.2 (Send Message):** The user must be able to type a message in an input field and send it.
- **FR-3.3 (Context Injection):** When a user sends a message, the backend must:
  1.  Retrieve the saved context for the current project from the database.
  2.  Construct a new prompt by prepending the context to the user's message (e.g., `Context: [Saved Context]\n\nUser Query: [User's Message]`).
  3.  Send this combined prompt to an external LLM API.
- **FR-3.4 (Receive and Display Response):** The backend must receive the response from the LLM and stream it back to the frontend. The frontend must display the AI's response in the chat window.
- **FR-3.5 (No Data Access):** The LLM and the chat functionality will **not** have access to the contents of the uploaded data files in this phase. Its knowledge is limited to the user-provided context.

#### **3.3. User Flow: Basic Context-Aware Chat**

1.  **Pre-condition:** The user has already uploaded `sales_data.csv` and saved the context: "This project analyzes daily sales data... 'QTY' is quantity sold..."
2.  The user navigates to the "Chat" tab.
3.  The user types the message: "What are some good KPIs to track?" and hits send.
4.  The backend retrieves the saved context.
5.  The backend constructs a prompt similar to: `Context: This project analyzes daily sales data for my e-commerce store... 'QTY' is quantity sold... \n\nUser Query: What are some good KPIs to track?`
6.  This prompt is sent to the LLM.
7.  The LLM, now aware that the context is e-commerce sales, provides a tailored response: "Great question! Based on your context of e-commerce sales, you should track KPIs like Average Order Value, Customer Lifetime Value, and Conversion Rate. You could also analyze your 'QTY' data to find the best-selling products."
8.  The response appears in the chat window for the user.
