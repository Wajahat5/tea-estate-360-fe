#!/bin/bash
for page in AuctionPage.tsx InventoryPage.tsx AssetsPage.tsx; do
  sed -i '/const user = useAppSelector/d' /app/src/pages/$page
  sed -i '/const companies = useAppSelector/d' /app/src/pages/$page
  sed -i '/const uniqueGardens = new Map<string, { label: string; value: string }>();/,/const gardenOptions = Array.from(uniqueGardens.values());/c\  const gardenOptions = useOwnedGardens();' /app/src/pages/$page
  sed -i '/import { useAppSelector }/c\import { useAppSelector } from "../store";\nimport { useOwnedGardens } from "../hooks/useOwnedGardens";' /app/src/pages/$page
done
