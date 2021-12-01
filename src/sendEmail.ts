import AWS from "aws-sdk";
import type React from "react";
import ReactDOMServer from "react-dom/server";

const ses = new AWS.SES();
const support = process.env.SUPPORT_EMAIL || "";

const sendEmail = ({
  to = support,
  body,
  subject,
  from = support,
}: {
  to?: string | string[];
  body: React.ReactElement | string;
  subject: string;
  from?: string;
}): Promise<string> =>
  ses
    .sendEmail({
      Destination: {
        ToAddresses: typeof to === "string" ? [to] : to,
      },
      Message: {
        Body: {
          Html: {
            Charset: "UTF-8",
            Data:
              typeof body === "string"
                ? body
                : ReactDOMServer.renderToStaticMarkup(body),
          },
        },
        Subject: {
          Charset: "UTF-8",
          Data: subject,
        },
      },
      Source: from,
    })
    .promise()
    .then((r) => r.MessageId);

export default sendEmail;
