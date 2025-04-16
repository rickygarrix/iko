export type Messages = {
  top: {
    catchphrase: string;
    title: string;
    search: string;
    recommend: string;
  };
  meta: {
    title: string;
    description: string;
  };
  header: {
    search: string;
    map: string;
  };
  about: {
    logo_alt: string;
    subtitle: string;
    description: string;
    button: string;
  };
  searchFilter: {
    title: string;
    open: string;
    open_all: string;
    open_now: string;
    genre: string;
    area: string;
    payment: string;
    reset: string;
    search: string;
    areas: {
      [key: string]: string;
    };
  };
  genres: {
    [key: string]: string;
  };
  payments: {
    [key: string]: string;
  };
  footer: {
    search: string;
    map: string;
    contact: string;
    terms: string;
    privacy: string;
    copyright: string;
  };
  recommend: {
    title: string;
    subtitle: string;
    open: string;
    closed: string;
    noDescription: string;
  };
  searchResults: {
    prompt: string;
    loading: string;
    error: string;
    notFound: string;
    resultLabel: string;
    items: string;
    open: string;
    closed: string;
    noDescription: string;
  };
  storeDetail: {
    mapTitle: string;
    descriptionLabel: string;
    paymentTitle: string;
    infoTitle: string;
    name: string;
    genre: string;
    address: string;
    access: string;
    hours: string;
    note: string;
    website: string;
  };
};