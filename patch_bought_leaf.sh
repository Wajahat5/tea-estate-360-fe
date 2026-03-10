sed -i '/const user = useAppSelector/d' /app/src/pages/BoughtLeafPage.tsx
sed -i '/const companies = useAppSelector/d' /app/src/pages/BoughtLeafPage.tsx
sed -i '/const gardens = user?.gardens/,/const gardenOptions = Array.from(uniqueGardens.values());/c\  const gardenOptions = useOwnedGardens();' /app/src/pages/BoughtLeafPage.tsx
