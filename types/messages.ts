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


};