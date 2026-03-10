import { useAppSelector } from "../store/hooks";

export const useOwnedGardens = () => {
  const user = useAppSelector((state) => state.auth.user);
  const companies = useAppSelector((state) => state.companies.items);

  const gardens = user?.gardens && user.gardens.length > 0
    ? user.gardens.map(g => ({ gardenid: g.gardenid || (g as any).id, name: (g as any).name || g.gardenid || (g as any).id }))
    : companies
      .filter((company) => company.ownerid === user?.userid)
      .flatMap((company) => company.gardens);

  const uniqueGardens = new Map<string, { gardenid: string; name: string }>();
  gardens.forEach((garden) => {
      const gid = garden.gardenid || (garden as any).id;
      if (gid) {
        uniqueGardens.set(gid, {
          gardenid: gid,
          name: garden.name || gid
        });
      }
  });

  return Array.from(uniqueGardens.values());
};
