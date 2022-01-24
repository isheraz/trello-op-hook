var express = require("express");
var router = express.Router();
const axios = require("axios");
const dayjs = require("dayjs");

var config = {
  method: "get",
  url: "https://projects.invozone.com/api/v3/projects/16/available_assignees",
  headers: {
    Authorization: `Basic ${process.env.OP_TOKEN}`,
  },
  data: "",
};

router.post("/work-package", async (req, res, next) => {
  let membersFound = null,
    hours = 0;
  try {
    const users = await axios(config);
    const { title, description, comment, members } = req.body;
    console.table(req.body);
    const membersArr = members.split(",");
    const { elements } = users.data._embedded;
    if (membersArr)
      membersFound = elements.filter((x) => {
        const member = membersArr.find((y) => x.name.toLowerCase() == y.toLowerCase());
        return member;
      });
    if (!!parseInt(comment?.split(",")[1]))
      hours = parseInt(comment?.split(",")[1]);
    const data = ({
      description: {
        format: "markdown",
        raw: `${description}\n\n\nAll Members: ${members}`,
      },
      startDate: dayjs().format("YYYY-MM-DD").toString(),
      estimatedTime: `PT${hours}H`,
      subject: title,
      _links: {
        project: {
          href: "/api/v3/projects/16",
          title: "Artefy Site",
        },
        author: {
          _type: "User",
          name: "Sheraz Ahmed",
        },
        ...(membersFound?.length > 0 && {
          assignee: membersFound[0]._links.self,
        }),
      },
    });

    const opTicket = await axios({
      method: "post",
      url: "https://projects.invozone.com/api/v3/work_packages/",
      headers: {
        Authorization: `Basic ${process.env.OP_TOKEN}`,
      },
      data: data,
    });

    console.log(opTicket.data._embedded);
    res.json({
      ticket: `https://projects.invozone.com${opTicket.data._embedded._links.status}`,
      time: dayjs().toString(),
    });
  } catch (err) {
    console.error(err);
  }
});

module.exports = router;
