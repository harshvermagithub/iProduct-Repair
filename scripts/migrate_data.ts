import { PrismaClient } from '@prisma/client'

const SRC_URL = "https://kwjgadsatdmiydzbpedt.supabase.co"
const SRC_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const prisma = new PrismaClient()

const TABLES = [
    "Brand",
    "City",
    "User",
    "Model",
    "Variant",
    "Rider",
    "Order",
    "EvaluationRule",
    "EmailMessage",
]

async function fetchTable(name: string) {
    const tableLow = name.toLowerCase()
    let allRows: any[] = []
    let offset = 0
    const limit = 1000

    while (true) {
        const url = `${SRC_URL}/rest/v1/${name}?select=*&limit=${limit}&offset=${offset}`
        const resp = await fetch(url, {
            headers: {
                'apikey': SRC_KEY,
                'Authorization': `Bearer ${SRC_KEY}`
            }
        })
        const data: any[] = await resp.json()
        if (!data || data.length === 0) break
        allRows = allRows.concat(data)
        if (data.length < limit) break
        offset += limit
    }
    return allRows
}

async function main() {
    console.log("Starting Migration...")

    for (const table of TABLES) {
        console.log(`\nMoving ${table}...`)
        const rows = await fetchTable(table)
        console.log(`Fetched ${rows.length} rows.`)

        if (rows.length === 0) continue

        // Insert rows one by one or in batches
        // Using createMany if supported, otherwise individual creates
        // Note: some tables might have specific logic, but for a general migration,
        // we use conflict resolution or delete first.

        for (const row of rows) {
            try {
                // @ts-ignore
                await prisma[table.toLowerCase()].upsert({
                    where: { id: row.id },
                    update: row,
                    create: row
                })
            } catch (err: any) {
                // If the table doesn't use 'id' as primary key (e.g. @@unique)
                // we handle it specifically.
                if (table === "EvaluationRule") {
                  try {
                    await prisma.evaluationRule.upsert({
                        where: { category_questionKey_answerKey: { category: row.category, questionKey: row.questionKey, answerKey: row.answerKey } },
                        update: row,
                        create: row
                    })
                  } catch (e: any) {
                     console.error(`  Error in ${table}:`, e.message)
                  }
                } else if (table === "City" && !row.id) {
                     // City uses ID but maybe it's missing in some cases?
                } else {
                    console.error(`  Error in ${table} (id: ${row.id}):`, err.message)
                }
            }
        }
        console.log(`Completed ${table}`)
    }

    console.log("\nMigration Finished!")
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
