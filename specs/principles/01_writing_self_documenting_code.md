### **Agent Directive: Writing Self-Documenting Code**

---

#### **1. Overview**

This guide provides the core principles for writing self-documenting code. Your primary objective is to produce code that is immediately understandable to human developers without requiring extensive external documentation. The code itself should tell the story of what it does and why.

---

#### **2. Core Principles**

- **Clarity over cleverness**: The code must be simple and straightforward.
- **No magic**: Avoid "magic numbers" and "magic strings." All constants must be named.
- **Single Source of Truth**: A piece of information or logic should exist in only one place.
- **Consistency**: The style and structure of the code should be consistent across the entire codebase.

---

#### **3. Naming Conventions**

Names are the most critical part of self-documenting code. They must be descriptive and unambiguous.

##### **3.1. Variables**

Use descriptive names that explain the variable's purpose.

**Python Example:**

```python
# BAD ❌
d = get_data()
l = 86400

# GOOD ✅
users_from_database = get_active_users()
SECONDS_IN_A_DAY = 86400
```

**TypeScript Example:**

```typescript
// BAD ❌
const data = fetchData();
const item = arr[0];

// GOOD ✅
const activeProjectList: Project[] = fetchActiveProjects();
const firstProjectInList: Project = activeProjectList[0];
```

##### **3.2. Functions and Methods**

Function names should be verbs that describe what the function does.

**Python Example:**

```python
# BAD ❌
def proc(data):
    # ...

# GOOD ✅
def fetch_and_validate_user_profile(user_id: str) -> UserProfile:
    # ...
```

**TypeScript Example:**

```typescript
// BAD ❌
function handle(id: string) {
  // ...
}

// GOOD ✅
function isUserSubscribedToNewsletter(userId: string): boolean {
  // ...
}
```

---

#### **4. Function and Method Design**

- **Single Responsibility**: Each function should do one thing and do it well.
- **Small Size**: Functions should be small enough to be easily understood.
- **Clear Arguments**: Use descriptive names for arguments and leverage type hints.

**TypeScript Example:**

```typescript
// BAD ❌ (Does too much)
function processAndSave(data: RawData, user: User, isUpdate: boolean) {
  // validation, transformation, and saving logic...
}

// GOOD ✅ (Separated concerns)
function validateRawData(data: RawData): ValidatedData {
  /* ... */
}
function transformDataForDatabase(data: ValidatedData): DatabaseRecord {
  /* ... */
}
function saveRecordToDatabase(record: DatabaseRecord): void {
  /* ... */
}
```

---

#### **5. The Role of Comments**

Comments should explain the **"why,"** not the **"what."** The code should explain what it is doing.

**Python Example:**

```python
# BAD ❌ (Comment just repeats the code)
# Increment the counter by one
counter += 1

# GOOD ✅ (Comment explains the business reason)
# We must process the final payment on the 25th to comply with
# accounting regulations for quarterly reporting.
if today.day == 25:
    process_final_payment(report)
```

---

#### **6. Practical Checklist**

Before committing code, verify it meets these criteria:

- [ ] Are all names descriptive and unambiguous?
- [ ] Is every function small and focused on a single responsibility?
- [ ] Are all "magic numbers" and strings replaced with named constants?
- [ ] Does the code leverage type hints (Python) or TypeScript types correctly?
- [ ] Do comments explain the "why" instead of the "what"?
- [ ] Is the code's structure and formatting consistent?
