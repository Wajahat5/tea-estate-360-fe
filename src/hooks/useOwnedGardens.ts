import { useAppSelector } from "../store/hooks";

export const useOwnedGardens = () => {
  const user = useAppSelector((state) => state.auth.user);
  const companies = useAppSelector((state) => state.companies.items);

  const gardens = user?.gardens && user.gardens.length > 0
    ? user.gardens.map(g => ({ gardenid: g.gardenid, name: (g as any).name || g.gardenid }))
    : companies
      .filter((company) => company.ownerid === user?.userid)
      .flatMap((company) => company.gardens);

  const uniqueGardens = new Map<string, { gardenid: string; name: string }>();
  gardens.forEach((garden) => {
      uniqueGardens.set(garden.gardenid, {
        gardenid: garden.gardenid,
        name: garden.name
      });
  });

  return Array.from(uniqueGardens.values());
};
