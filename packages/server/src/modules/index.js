import journal from "./journal";
import subject from "./subject";
import counter from "./counter";
import post from "./post";
import upload from "./upload";
import user from "./user";
import subscription from "./subscription";
import contact from "./contact";
import mailer from "./mailer";
import graphqlTypes from "./graphqlTypes";
import apolloEngine from "./apolloEngine";
import "./debug";

import Feature from "./connector";

export default new Feature(
  journal,
  subject,
  counter,
  post,
  upload,
  user,
  subscription,
  contact,
  mailer,
  graphqlTypes,
  apolloEngine
);
