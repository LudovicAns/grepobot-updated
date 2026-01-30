/**
 * FormBuilder module: helpers for building bot UI controls.
 * Responsibilities: render buttons, checkboxes, inputs, and selects.
 */
FormBuilder = {
  button: function (config) {
    return $("<div/>")["append"](
      $("<a/>", {
        "\x63\x6C\x61\x73\x73": "button_new" + (config["class"] || ""),
        "\x68\x72\x65\x66": "#",
        "\x73\x74\x79\x6C\x65":
          "margin-top:1px;float:left;" + (config["style"] || ""),
      })
        ["append"](
          $("<span/>", {
            "\x63\x6C\x61\x73\x73": "left",
          }),
        )
        ["append"](
          $("<span/>", {
            "\x63\x6C\x61\x73\x73": "right",
          }),
        )
        ["append"](
          $("<div/>", {
            "\x63\x6C\x61\x73\x73": "caption js-caption",
          })["text"](config["name"]),
        ),
    );
  },
  checkbox: function (config, onCheck, onUncheck) {
    return $("<div/>", {
      "\x63\x6C\x61\x73\x73":
        "checkbox_new" +
        (config["checked"] ? " checked" : "") +
        (config["disabled"] ? " disabled" : ""),
      "\x73\x74\x79\x6C\x65": "padding: 5px;" + (config["style"] || ""),
    })
      ["append"](
        $("<input/>", {
          "\x74\x79\x70\x65": "checkbox",
          "\x6E\x61\x6D\x65": config["name"],
          "\x69\x64": config["id"],
          "\x63\x68\x65\x63\x6B\x65\x64": config["checked"],
          "\x73\x74\x79\x6C\x65": "display: none;",
        }),
      )
      ["append"](
        $("<div/>", {
          "\x63\x6C\x61\x73\x73": "cbx_icon",
          "\x72\x65\x6C": config["name"],
        }),
      )
      ["append"](
        $("<div/>", {
          "\x63\x6C\x61\x73\x73": "cbx_caption",
        })["text"](config["text"]),
      )
      ["bind"]("click", function () {
        $(this)["toggleClass"]("checked");
        $(this)
          ["find"]($('input[type="checkbox"]'))
          ["prop"]("checked", $(this)["hasClass"]("checked"));
        if ($(this)["hasClass"]("checked")) {
          if (onCheck != undefined) {
            onCheck();
          }
        } else {
          if (onUncheck != undefined) {
            onUncheck();
          }
        }
      });
  },
  input: function (config) {
    return $("<div/>", {
      "\x73\x74\x79\x6C\x65": "padding: 5px;",
    })
      ["append"](
        $("<label/>", {
          "\x66\x6F\x72": config["id"],
        })["text"](config["name"] + ": "),
      )
      ["append"](
        $("<div/>", {
          "\x63\x6C\x61\x73\x73": "textbox",
          "\x73\x74\x79\x6C\x65": config["style"],
        })
          ["append"](
            $("<div/>", {
              "\x63\x6C\x61\x73\x73": "left",
            }),
          )
          ["append"](
            $("<div/>", {
              "\x63\x6C\x61\x73\x73": "right",
            }),
          )
          ["append"](
            $("<div/>", {
              "\x63\x6C\x61\x73\x73": "middle",
            })["append"](
              $("<div/>", {
                "\x63\x6C\x61\x73\x73": "ie7fix",
              })["append"](
                $("<input/>", {
                  "\x74\x79\x70\x65": config["type"],
                  "\x74\x61\x62\x69\x6E\x64\x65\x78": "1",
                  "\x69\x64": config["id"],
                  "\x6E\x61\x6D\x65": config["id"],
                  "\x76\x61\x6C\x75\x65": config["value"],
                })["attr"]("size", config["size"]),
              ),
            ),
          ),
      );
  },
  textarea: function (config) {
    return $("<div/>", {
      "\x73\x74\x79\x6C\x65": "padding: 5px;",
    })
      ["append"](
        $("<label/>", {
          "\x66\x6F\x72": config["id"],
        })["text"](config["name"] + ": "),
      )
      ["append"](
        $("<div/>")["append"](
          $("<textarea/>", {
            "\x6E\x61\x6D\x65": config["id"],
            "\x69\x64": config["id"],
          }),
        ),
      );
  },
  inputMinMax: function (config) {
    return $("<div/>", {
      "\x63\x6C\x61\x73\x73": "textbox",
    })
      ["append"](
        $("<span/>", {
          "\x63\x6C\x61\x73\x73": "grcrt_spinner_btn grcrt_spinner_down",
          "\x72\x65\x6C": config["name"],
        })["click"](function () {
          var inputField = $(this)
            ["parent"]()
            ["find"]("#" + $(this)["attr"]("rel"));
          if (
            parseInt($(inputField)["attr"]("min")) <
            parseInt($(inputField)["attr"]("value"))
          ) {
            $(inputField)["attr"](
              "value",
              parseInt($(inputField)["attr"]("value")) - 1,
            );
          }
        }),
      )
      ["append"](
        $("<div/>", {
          "\x63\x6C\x61\x73\x73": "textbox",
          "\x73\x74\x79\x6C\x65": config["style"],
        })
          ["append"](
            $("<div/>", {
              "\x63\x6C\x61\x73\x73": "left",
            }),
          )
          ["append"](
            $("<div/>", {
              "\x63\x6C\x61\x73\x73": "right",
            }),
          )
          ["append"](
            $("<div/>", {
              "\x63\x6C\x61\x73\x73": "middle",
            })["append"](
              $("<div/>", {
                "\x63\x6C\x61\x73\x73": "ie7fix",
              })["append"](
                $("<input/>", {
                  "\x74\x79\x70\x65": "text",
                  "\x74\x61\x62\x69\x6E\x64\x65\x78": "1",
                  "\x69\x64": config["name"],
                  "\x76\x61\x6C\x75\x65": config["value"],
                  "\x6D\x69\x6E": config["min"],
                  "\x6D\x61\x78": config["max"],
                })
                  ["attr"]("size", config["size"] || 10)
                  ["css"]("text-align", "right"),
              ),
            ),
          ),
      )
      ["append"](
        $("<span/>", {
          "\x63\x6C\x61\x73\x73": "grcrt_spinner_btn grcrt_spinner_up",
          "\x72\x65\x6C": config["name"],
        })["click"](function () {
          var inputField = $(this)
            ["parent"]()
            ["find"]("#" + $(this)["attr"]("rel"));
          if (
            parseInt($(inputField)["attr"]("max")) >
            parseInt($(inputField)["attr"]("value"))
          ) {
            $(inputField)["attr"](
              "value",
              parseInt($(inputField)["attr"]("value")) + 1,
            );
          }
        }),
      );
  },
  inputSlider: function (config) {
    return $("<div/>", {
      "\x69\x64": "grcrt_" + config["name"] + "_config",
    })
      ["append"](
        $("<div/>", {
          "\x63\x6C\x61\x73\x73": "slider_container",
        })
          ["append"](
            $("<div/>", {
              "\x73\x74\x79\x6C\x65": "float:left;width:120px;",
            })["html"](config["name"]),
          )
          ["append"](
            FormBuilder["input"]({
              "\x6E\x61\x6D\x65": "grcrt_" + config["name"] + "_value",
              "\x73\x74\x79\x6C\x65": "float:left;width:33px;",
            })["hide"](),
          )
          ["append"](
            $("<div/>", {
              "\x63\x6C\x61\x73\x73": "windowmgr_slider",
              "\x73\x74\x79\x6C\x65": "width: 200px;float: left;",
            })["append"](
              $("<div/>", {
                "\x63\x6C\x61\x73\x73": "grepo_slider sound_volume",
              }),
            ),
          ),
      )
      ["append"](
        $("<script/>", {
          "\x74\x79\x70\x65": "text/javascript",
        })["text"](
          "" +
            "RepConv.slider = $('#grcrt_" +
            config["name"] +
            "_config .sound_volume').grepoSlider({\x0A" +
            "min: 0,\x0A" +
            "max: 100,\x0A" +
            "step: 5,\x0A" +
            "value: " +
            config["volume"] +
            ",\x0A" +
            "template: 'tpl_grcrt_slider'\x0A" +
            "}).on('sl:change:value', function (e, _sl, value) {\x0A" +
            "$('#grcrt_" +
            config["name"] +
            "_value').attr('value',value);\x0A" +
            "if (RepConv.audio.test != undefined){\x0A" +
            "RepConv.audio.test.volume = value/100;\x0A" +
            "}\x0A" +
            "}),\x0A" +
            "$('#grcrt_" +
            config["name"] +
            "_config .button_down').css('background-position','-144px 0px;'),\x0A" +
            "$('#grcrt_" +
            config["name"] +
            "_config .button_up').css('background-position','-126px 0px;')\x0A" +
            "",
        ),
      );
  },
  selectBox: function (config) {
    return $("<div/>", {
      "\x73\x74\x79\x6C\x65": "padding: 5px",
    })
      ["append"](
        $("<input/>", {
          "\x74\x79\x70\x65": "hidden",
          "\x6E\x61\x6D\x65": config["name"],
          "\x69\x64": config["id"],
          "\x76\x61\x6C\x75\x65": config["value"],
        }),
      )
      ["append"](
        $("<label/>", {
          "\x66\x6F\x72": config["id"],
        })["text"](config["label"]),
      )
      ["append"](
        $("<div/>", {
          "\x69\x64": config["id"],
          "\x63\x6C\x61\x73\x73": "dropdown default",
          "\x73\x74\x79\x6C\x65": config["styles"],
        })
          ["dropdown"]({
            list_pos: "left",
            value: config["value"],
            disabled: config["disabled"] || false,
            options: config["options"],
          })
          ["on"]("dd:change:value", function (event, newValue) {
            $("#" + config["id"])["attr"]("value", newValue);
          }),
      );
  },
  timerBoxFull: function (config) {
    return $("<div/>", {
      "\x63\x6C\x61\x73\x73":
        "single-progressbar instant_buy js-progressbar type_building_queue",
      "\x69\x64": config["id"],
      "\x73\x74\x79\x6C\x65": config["styles"],
    })
      ["append"](
        $("<div/>", {
          "\x63\x6C\x61\x73\x73": "border_l",
        }),
      )
      ["append"](
        $("<div/>", {
          "\x63\x6C\x61\x73\x73": "border_r",
        }),
      )
      ["append"](
        $("<div/>", {
          "\x63\x6C\x61\x73\x73": "body",
        }),
      )
      ["append"](
        $("<div/>", {
          "\x63\x6C\x61\x73\x73": "progress",
        })["append"](
          $("<div/>", {
            "\x63\x6C\x61\x73\x73": "indicator",
            "\x73\x74\x79\x6C\x65": "width: 0%;",
          }),
        ),
      )
      ["append"](
        $("<div/>", {
          "\x63\x6C\x61\x73\x73": "caption",
        })
          ["append"](
            $("<span/>", {
              "\x63\x6C\x61\x73\x73": "text",
            }),
          )
          ["append"](
            $("<span/>", {
              "\x63\x6C\x61\x73\x73": "value_container",
            })["append"](
              $("<span/>", {
                "\x63\x6C\x61\x73\x73": "curr",
              })["html"]("0%"),
            ),
          ),
      );
  },
  timerBoxSmall: function (config) {
    return $("<div/>", {
      "\x63\x6C\x61\x73\x73":
        "single-progressbar instant_buy js-progressbar type_building_queue",
      "\x69\x64": config["id"],
      "\x73\x74\x79\x6C\x65": config["styles"],
    })
      ["append"](
        $("<div/>", {
          "\x63\x6C\x61\x73\x73": "progress",
        })["append"](
          $("<div/>", {
            "\x63\x6C\x61\x73\x73": "indicator",
            "\x73\x74\x79\x6C\x65": "width: 0%;",
          }),
        ),
      )
      ["append"](
        $("<div/>", {
          "\x63\x6C\x61\x73\x73": "caption",
        })
          ["append"](
            $("<span/>", {
              "\x63\x6C\x61\x73\x73": "text",
            }),
          )
          ["append"](
            $("<span/>", {
              "\x63\x6C\x61\x73\x73": "value_container",
            })["append"](
              $("<span/>", {
                "\x63\x6C\x61\x73\x73": "curr",
              })["html"](config["text"] ? config["text"] : "-"),
            ),
          ),
      );
  },
  gameWrapper: function (title, wrapperId, content, styles) {
    return $("<div/>", {
      "\x63\x6C\x61\x73\x73": "game_inner_box",
      "\x73\x74\x79\x6C\x65": styles,
      "\x69\x64": wrapperId,
    })["append"](
      $("<div/>", {
        "\x63\x6C\x61\x73\x73": "game_border",
      })
        ["append"](
          $("<div/>", {
            "\x63\x6C\x61\x73\x73": "game_border_top",
          }),
        )
        ["append"](
          $("<div/>", {
            "\x63\x6C\x61\x73\x73": "game_border_bottom",
          }),
        )
        ["append"](
          $("<div/>", {
            "\x63\x6C\x61\x73\x73": "game_border_left",
          }),
        )
        ["append"](
          $("<div/>", {
            "\x63\x6C\x61\x73\x73": "game_border_right",
          }),
        )
        ["append"](
          $("<div/>", {
            "\x63\x6C\x61\x73\x73": "game_border_top",
          }),
        )
        ["append"](
          $("<div/>", {
            "\x63\x6C\x61\x73\x73": "game_border_corner corner1",
          }),
        )
        ["append"](
          $("<div/>", {
            "\x63\x6C\x61\x73\x73": "game_border_corner corner2",
          }),
        )
        ["append"](
          $("<div/>", {
            "\x63\x6C\x61\x73\x73": "game_border_corner corner3",
          }),
        )
        ["append"](
          $("<div/>", {
            "\x63\x6C\x61\x73\x73": "game_border_corner corner4",
          }),
        )
        ["append"](
          $("<div/>", {
            "\x63\x6C\x61\x73\x73": "game_header bold",
            "\x69\x64": "settings_header",
          })["html"](title),
        )
        ["append"]($("<div/>")["append"](content)),
    );
  },
};
