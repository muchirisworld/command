# Merchant Guide: Mastering Your Product Operations

In the world of commerce, a "sale" looks simple on the surface: a customer picks a product and pays for it. But for a growing business, the reality behind the scenes is often a complex dance of packaging, purchasing, and stock math.

The **Command** dashboard is designed to take that complexity and make it invisible, allowing you to focus on selling while we handle the operational heavy lifting.

---

## 1. Products & Variants: Organize Like a Pro
Most systems treat every item as a standalone "product." If you sell a T-shirt in five sizes, you have five different products to manage. In **Command**, we use a **Product & Variant** model.

### Real-World Workflow: The Apparel Merchant
Imagine you sell a "Signature Cotton Tee." Instead of cluttering your catalog with "Tee Small," "Tee Medium," and "Tee Large," you have **one Product** with **multiple Variants**.
- **The Benefit:** You get a unified view of how that specific design is performing across all sizes. You can update the description once, and it reflects everywhere.
- **Fast Action:** Add a new "Extra Large" variant in seconds without re-entering brand or category data.

---

## 2. Unit Conversions: Buy in Bulk, Sell in "Eaches"
One of the biggest headaches for merchants is the mismatch between how they *buy* stock and how they *sell* it.

### Real-World Workflow: The Beverage Shop
You purchase your "Craft IPA" from a distributor by the **Case (24 units)**, but you sell them as **Single Bottles**.
- **The Old Way:** Every time a case arrives, you manually multiply 24 by the number of cases and type that into your inventory.
- **The Command Way:** You define a **Unit Conversion**. Tell the system that `1 Case = 24 Bottles`.
- **The Benefit:** When you receive 10 cases at the loading dock, you simply enter "10 Cases." Command automatically updates your inventory to show 240 bottles available for sale. No calculators required.

#### Deep Dive: The Conversion Form
When you add a conversion in the app, you'll see four simple fields. Here is how to think about them using the **Beverage Shop** example:

1.  **From Unit:** This is your "Bulk" unit. (Example: `CASE`)
2.  **To Unit:** This is your "Selling" unit. It is automatically set to your product's **Base Unit**. (Example: `BOTTLE`)
3.  **Factor:** The magic number. Ask yourself: *"How many [Selling Units] are in one [Bulk Unit]?"* (Example: `24`)
4.  **Precision:** How granular do you need to be? For bottles, you use `0` because you don't sell half-bottles. For something like "Coffee Beans" sold by weight, you might use `2` to track stock down to `0.01` grams.

---

## 3. Intelligent Stock: Total vs. Available
Simple inventory systems only show one number: "What's on the shelf." But if you sell online and in-store simultaneously, that number is a lie.

### Real-World Workflow: The High-Volume Flash Sale
If you have 100 "Limited Edition Prints" left and 20 people have them in their online carts right now, you don't actually have 100 to sell to the person standing in front of you.
- **Total Stock:** Every physical unit in your warehouse (100).
- **Reserved Stock:** Units committed to open orders or active carts (20).
- **Available Stock:** What your storefront actually tells customers is for sale (80).
- **The Benefit:** Never oversell again. Command protects your reputation by ensuring you only promise what you can deliver.

---

## 4. Operational Speed: The Cmd+K Power
Command is an **operational interface**. We know that every second you spend clicking through menus is a second you aren't helping a customer.

- **Global Search (Cmd+K):** Just like the professional tools used by developers and power users, you can press `Cmd+K` from anywhere in the app to jump to any product.
- **Table-First Design:** We prioritize dense, Sortable tables over fancy icons. See your SKUs, prices, and stock levels in a single glance.

---

## Summary
Command isn't just a place to list items; it's the **brain of your warehouse**. By handling the relationship between variants, automating the math of unit conversions, and protecting your "Available" stock levels, we give you the tools of a global retailer with the ease of use of a local shop.