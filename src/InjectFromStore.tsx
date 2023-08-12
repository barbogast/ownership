type Props<E> = {
  id: string;
  child: (entity: E) => JSX.Element;
  useFunc: (id: string) => E | undefined;
};

const InjectFromStore = <E,>({ child, id, useFunc }: Props<E>) => {
  const entity = useFunc(id);
  if (!entity) {
    return `ID ${id} not found.`;
  }
  return child(entity);
};

export default InjectFromStore;
