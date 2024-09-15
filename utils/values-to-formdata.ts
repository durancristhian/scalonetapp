export const valuesToFormData: (values: Record<string, string>) => FormData = (
  values
) => {
  const formData = new FormData();

  for (const [key, value] of Object.entries(values)) {
    formData.append(key, value);
  }

  return formData;
};
