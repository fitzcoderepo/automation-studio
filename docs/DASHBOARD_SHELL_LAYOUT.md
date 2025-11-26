# Dashboard Shell Layout

_Last updated: 2025-11-26_

Defines the global dashboard shell used across all Automation Studio pages.

---

## 1. Purpose

- Provide a consistent two-column layout.
- House global navigation.
- Apply dark theme styles.
- Keep pages structurally uniform.

---

## 2. File Location

    src/components/dashboard-shell.tsx

---

## 3. Layout Structure (as plain indented code)

    <div className="flex min-h-screen">
      <aside className="w-64 bg-slate-950 border-r border-slate-800 p-6">
        Automation Studio
        Navigation links...
      </aside>

      <main className="flex-1 p-10">
        {children}
      </main>
    </div>

---

## 4. Sidebar Navigation Links

- /users  
- /chatbot  
- /conversations  
- /files  
- /automation  
- /inventory (future)

---

## 5. Design Notes

- Sidebar is fixed width (64 * 4px = 256px).
- Right side scrolls independently.
- Dark theme: slate palette.
- No forced equal-height columns.
- Shell wraps all major feature pages.

---

## 6. Future Enhancements

- Collapsible sidebar option.
- User avatar and actions (post-auth).
- Breadcumbs or global section title strip.
