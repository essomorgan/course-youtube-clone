import { db } from "@/db";
import { categories } from "@/db/local-schema";

const categoryNames = [
  "Cars and vehicles",
  "Comedy",
  "Education",
  "Gaming",
  "Entertainment",
  "Flim and animation",
  "How-to and style",
  "Music",
  "News and politics",
  "People and animals",
  "Science and technology",
  "Sports",
  "Travel and events",
];

async function main(/* params:type */) {


  try {
    const values = categoryNames.map((name) => ({
      name,
      description: `Videos related to ${name.toLowerCase()}`,
    }));

    await db.insert(categories).values(values);
    console.log("Categories seeded successfully!");
  } catch (error) {
    console.error("Error seeding categories:", error);
    process.exit(1);
  }
};

main();