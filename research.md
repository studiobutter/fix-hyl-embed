<!-- markdownlint-disable MD034 -->
# Fixing HoYoLAB Embed

This is a research document for HoYoLAB Embed and how to fix it.

When user share a HoYoLAB Link, it comes in 4 different form of links, seperate by category.

## Long Link

- They are direct link where user will be reading the post

  - Links: https://www.hoyolab.com/article/[post_id], https://m.hoyolab.com/#/article/[post_id]

## Short Link

- These are links that starts with hoyo.link and redirects user to many things besides HoYoLAB Post, including but not limited to, Official account channels, HoYoLAB Post, Downloads, Game Downloads, Internal websites, etc.

- Main short links are links that redirects user to a certain page. It can be a HoYoLAB page, a Google Drive Folder, Direct Download Link for HoYoPlay, etc.

  - Link Pattern: https://hoyo.link/[short_link_id]
  - Example: https://hoyo.link/v1xJyPgfc

- Short links with the `?q=` are usually indication for HoYoLAB Post

- Links with `?m_code=` usually indicate Web Event with an Invite code, tho depend on the web event, the short link payload might be different. Example: "Skirk's Unlimited Throwing" Web Event Link uses `itc=`, and Genshin's 5th Anniversary Web Event "Through Yesterdays, to Today", uses `i_code=`, "Stand with Mavuika" Web Event uses `ucode=`, "Ignited: Blaze to Natlan" uses `u_code=`.

## How should I tackle this

To tackle this, we need to first differenciate between HoYoLAB Links and other links. When user tries to visit the page using the short link, it always send a HTTP/1.1 Request status 302 Found. Usually with `?q=` links, it has multiple stack of redirects. Let it redirect so we can grab the Long link. This can be achieve with a project call [Embed Fixer](https://github.com/seriaati/embed-fixer) by [seria_ati](https://github.com/seriaati/) using Python Request.

Besides that, we will need to handle how short link works on our end instead of just relying on a Discord Bot if the link was share outside Discord. If the link is a long HoYoLAB link, we can parse data from our end. If it's another different from HoYoLAB link like Web Event, Google Drive link, Download Link, etc. Just use the source link to render the embed instead.

Once the long link was obtained, we need to grab the [post_id] and render the embed.

Parsed Data URL: https://bbs-api-os.hoyolab.com/community/post/wapi/getPostFull?post_id=[post_id]&read=1&scene=1

The link above contains the Data that is already parsed for us to use directly from HoYo.

Parsed Data:

```jsonc
{
  "retcode": 0,
  "message": "OK",
  "data": {
    "post": {
      "post": {
        "game_id": 6, // Unneccessary
        "post_id": "post_id",
        "f_forum_id": 0,
        "uid": "172534910",
        "subject": "Post Title", // Required for Embed
        "content": "Post Content (HTML)",
        "cover": "",
        "view_type": 1,
        "created_at": 1765166407,
        "images": [],
        "post_status": {
          "is_top": false,
          "is_good": false,
          "is_official": false,
          "is_vote": false,
          "is_quiz_vote": false,
          "is_demoted": false,
          "is_hot": false
        },
        "topic_ids": [],
        "view_status": 1,
        "max_floor": 730,
        "is_original": 1,
        "republish_authorization": 2,
        "reply_time": "2025-12-09 05:13:59",
        "is_deleted": 0,
        "is_interactive": false,
        "structured_content": "Post Structured Content (JSON)",
        "structured_content_rows": [],
        "lang": "en-us",
        "official_type": 1,
        "reply_forbid": {
          "date_type": 0,
          "start_date": "0",
          "cur_date": "0",
          "level": 0
        },
        "video": "",
        "contribution_id": "0",
        "event_start_date": "0",
        "event_end_date": "0",
        "classification_id": "22",
        "is_audit": false,
        "is_multi_language": true,
        "origin_lang": "en-us",
        "sub_type": 0,
        "reprint_source": "",
        "can_edit": true,
        "last_modify_time": 0,
        "multi_language_info": {
          "langs": [
            "zh-cn",
            "zh-tw",
            "en-us",
            "id-id",
            "th-th",
            "de-de",
            "fr-fr",
            "es-es",
            "pt-pt",
            "ru-ru",
            "ko-kr",
            "vi-vn",
            "ja-jp",
            "tr-tr",
            "it-it"
          ],
          "future_post_id": "21414",
          "lang_subject": {
            "zh-cn": "title_chs",
            "tr-tr": "title_tr",
            "id-id": "title_id",
            "es-es": "title_es",
            "de-de": "title_de",
            "vi-vn": "title_vi",
            "ja-jp": "title_ja",
            "ko-kr": "title_ko",
            "pt-pt": "title_pt",
            "en-us": "title_en",
            "fr-fr": "title_fr",
            "ru-ru": "title_ru",
            "th-th": "title_th",
            "zh-tw": "title_cht",
            "it-it": "title_it"
          },
          "lang_content": {},
          "lang_structured_content": {}
        },
        "visible_level": 1,
        "has_cover": false,
        "suid": "0",
        "desc": "Post Description", // Required for Embed
        "game_uid": "0",
        "game_region": ""
      },
      "forum": null,
      "topics": [],
      "user": {
        "uid": "172534910",
        "nickname": "username", // Required for Embed
        "introduce": "",
        "avatar": "-1",
        "gender": 0,
        "certification": {
          "type": 1,
          "icon_url": "",
          "desc": ""
        },
        "level_exp": {
          "level": 0,
          "exp": 0
        },
        "is_following": true,
        "is_followed": false,
        "avatar_url": "user_pfp", // Required for Embed
        "auth": null,
        "is_logoff": false,
        "pendant": "",
        "was_following": false,
        "post_num": 2204,
        "suid": "0",
        "black_relation": {
          "is_blacking": false,
          "is_blacked": false
        },
        "badge": null,
        "lantern": null,
        "otaku_devotion_title": {
          "icon": "",
          "name": "",
          "desc": "",
          "otaku_identity": "OtakuIdentityNone",
          "accompany_title": "AccompanyTitleUnknown",
          "role_id": "0"
        },
        "allow_community": true,
        "content_cannot_be_upvoted": false,
        "content_cannot_be_replied": false,
        "post_cannot_be_shared": false,
        "post_cannot_be_collected": false,
        "cannot_be_followed": false
      },
      "self_operation": {
        "attitude": 0,
        "is_collected": false
      },
      "stat": {
        "view_num": 231373,
        "reply_num": 1044,
        "like_num": 4169,
        "bookmark_num": 573,
        "share_num": 321,
        "view_num_unit": "",
        "reply_num_unit": "",
        "like_num_unit": "",
        "bookmark_num_unit": "",
        "share_num_unit": "",
        "true_view_num": 0,
        "click_view_num": 0,
        "summary_for_creator": null,
        "multi_upvote_stats": [
          {
            "upvote_id": "1",
            "upvote_num": 3808
          },
          {
            "upvote_id": "2",
            "upvote_num": 150
          },
          {
            "upvote_id": "8",
            "upvote_num": 72
          },
          {
            "upvote_id": "3",
            "upvote_num": 50
          },
          {
            "upvote_id": "4",
            "upvote_num": 35
          },
          {
            "upvote_id": "7",
            "upvote_num": 19
          },
          {
            "upvote_id": "9",
            "upvote_num": 12
          },
          {
            "upvote_id": "6",
            "upvote_num": 9
          },
          {
            "upvote_id": "5",
            "upvote_num": 7
          },
          {
            "upvote_id": "10",
            "upvote_num": 7
          }
        ],
        "self_operation": null,
        "expose_view_num": 0
      },
      "help_sys": null,
      "cover": null,
      "image_list": [
        // Required for Embed (URL only)
        {
          "url": "[image_url]",
          "height": 1080,
          "width": 1920,
          "format": "PNG",
          "size": "4218795",
          "spoiler": false,
          "cuts": [
            {
              "ratio": 1,
              "lt_point": {
                "x": 207,
                "y": 116
              },
              "rb_point": {
                "x": 902,
                "y": 1042
              }
            },
            {
              "ratio": 2,
              "lt_point": {
                "x": 207,
                "y": 232
              },
              "rb_point": {
                "x": 1134,
                "y": 926
              }
            },
            {
              "ratio": 3,
              "lt_point": {
                "x": 207,
                "y": 116
              },
              "rb_point": {
                "x": 1134,
                "y": 1042
              }
            },
            {
              "ratio": 4,
              "lt_point": {
                "x": 207,
                "y": 433
              },
              "rb_point": {
                "x": 1134,
                "y": 954
              }
            }
          ],
          "tag_info": {
            "is_long_picture": false
          },
          "template_info": null,
          "image_id": "126528622"
        },
        {
          "url": "[image_url]",
          "height": 1440,
          "width": 2560,
          "format": "JPEG",
          "size": "415741",
          "spoiler": false,
          "cuts": [
            {
              "ratio": 4,
              "lt_point": {
                "x": 657,
                "y": 92
              },
              "rb_point": {
                "x": 1721,
                "y": 690
              }
            },
            {
              "ratio": 1,
              "lt_point": {
                "x": 728,
                "y": 92
              },
              "rb_point": {
                "x": 1650,
                "y": 1323
              }
            },
            {
              "ratio": 2,
              "lt_point": {
                "x": 657,
                "y": 92
              },
              "rb_point": {
                "x": 1721,
                "y": 890
              }
            },
            {
              "ratio": 3,
              "lt_point": {
                "x": 657,
                "y": 92
              },
              "rb_point": {
                "x": 1721,
                "y": 1156
              }
            }
          ],
          "tag_info": {
            "is_long_picture": false
          },
          "template_info": null,
          "image_id": "126528648"
        },
        {
          "url": "[image_url]",
          "height": 1440,
          "width": 2560,
          "format": "JPEG",
          "size": "379178",
          "spoiler": false,
          "cuts": [
            {
              "ratio": 2,
              "lt_point": {
                "x": 0,
                "y": 60
              },
              "rb_point": {
                "x": 1260,
                "y": 1005
              }
            },
            {
              "ratio": 3,
              "lt_point": {
                "x": 0,
                "y": 60
              },
              "rb_point": {
                "x": 1260,
                "y": 1320
              }
            },
            {
              "ratio": 4,
              "lt_point": {
                "x": 0,
                "y": 60
              },
              "rb_point": {
                "x": 1260,
                "y": 769
              }
            },
            {
              "ratio": 1,
              "lt_point": {
                "x": 65,
                "y": 12
              },
              "rb_point": {
                "x": 1135,
                "y": 1439
              }
            }
          ],
          "tag_info": {
            "is_long_picture": false
          },
          "template_info": null,
          "image_id": "126528681"
        },
        {
          "url": "[image_url]",
          "height": 1440,
          "width": 2560,
          "format": "JPEG",
          "size": "541337",
          "spoiler": false,
          "cuts": [
            {
              "ratio": 1,
              "lt_point": {
                "x": 0,
                "y": 486
              },
              "rb_point": {
                "x": 461,
                "y": 1101
              }
            },
            {
              "ratio": 2,
              "lt_point": {
                "x": 0,
                "y": 486
              },
              "rb_point": {
                "x": 461,
                "y": 832
              }
            },
            {
              "ratio": 3,
              "lt_point": {
                "x": 0,
                "y": 486
              },
              "rb_point": {
                "x": 461,
                "y": 947
              }
            },
            {
              "ratio": 4,
              "lt_point": {
                "x": 0,
                "y": 486
              },
              "rb_point": {
                "x": 461,
                "y": 745
              }
            }
          ],
          "tag_info": {
            "is_long_picture": false
          },
          "template_info": null,
          "image_id": "126528695"
        }
      ],
      "is_official_master": false,
      "is_user_master": false,
      "hot_reply_exist": true,
      "vote_count": 0,
      "last_modify_time": 0,
      "contribution": null,
      "classification": {
        "id": "22",
        "name": "Discussions \u0026 Sharing",
        "icon": ""
      },
      "video": null,
      "game": {
        "game_id": 6,
        "game_name": "game_name",
        "color": "#25A0E7", // Required for Embed
        "background_color": "#F3E9C8",
        "icon": ""
      },
      "data_box": "",
      "is_top_icon": false,
      "tags": {
        "is_user_top": false,
        "is_qualified_post": true,
        "is_hot_entry_post": false,
        "hot_topic_idx": 0,
        "is_doujin_force_post": false,
        "is_exclusive": false,
        "is_show_official_channel_jump": false
      },
      "hot_reply": null,
      "collection": null,
      "is_rich_text": false,
      "catalog_style_hint": 0,
      "cover_list": [
        {
          "url": "", // required for embed
          "height": 1080,
          "width": 1920,
          "format": "PNG",
          "size": "4218795",
          "spoiler": false,
          "cuts": [
            {
              "ratio": 1,
              "lt_point": {
                "x": 207,
                "y": 116
              },
              "rb_point": {
                "x": 902,
                "y": 1042
              }
            },
            {
              "ratio": 2,
              "lt_point": {
                "x": 207,
                "y": 232
              },
              "rb_point": {
                "x": 1134,
                "y": 926
              }
            },
            {
              "ratio": 3,
              "lt_point": {
                "x": 207,
                "y": 116
              },
              "rb_point": {
                "x": 1134,
                "y": 1042
              }
            },
            {
              "ratio": 4,
              "lt_point": {
                "x": 207,
                "y": 433
              },
              "rb_point": {
                "x": 1134,
                "y": 954
              }
            }
          ],
          "tag_info": {
            "is_long_picture": false
          },
          "template_info": null,
          "image_id": "126528622"
        },
        {
          "url": "", // required for embed
          "height": 1440,
          "width": 2560,
          "format": "JPEG",
          "size": "415741",
          "spoiler": false,
          "cuts": [
            {
              "ratio": 4,
              "lt_point": {
                "x": 657,
                "y": 92
              },
              "rb_point": {
                "x": 1721,
                "y": 690
              }
            },
            {
              "ratio": 1,
              "lt_point": {
                "x": 728,
                "y": 92
              },
              "rb_point": {
                "x": 1650,
                "y": 1323
              }
            },
            {
              "ratio": 2,
              "lt_point": {
                "x": 657,
                "y": 92
              },
              "rb_point": {
                "x": 1721,
                "y": 890
              }
            },
            {
              "ratio": 3,
              "lt_point": {
                "x": 657,
                "y": 92
              },
              "rb_point": {
                "x": 1721,
                "y": 1156
              }
            }
          ],
          "tag_info": {
            "is_long_picture": false
          },
          "template_info": null,
          "image_id": "126528648"
        },
        {
          "url": "", // required for embed
          "height": 1440,
          "width": 2560,
          "format": "JPEG",
          "size": "379178",
          "spoiler": false,
          "cuts": [
            {
              "ratio": 2,
              "lt_point": {
                "x": 0,
                "y": 60
              },
              "rb_point": {
                "x": 1260,
                "y": 1005
              }
            },
            {
              "ratio": 3,
              "lt_point": {
                "x": 0,
                "y": 60
              },
              "rb_point": {
                "x": 1260,
                "y": 1320
              }
            },
            {
              "ratio": 4,
              "lt_point": {
                "x": 0,
                "y": 60
              },
              "rb_point": {
                "x": 1260,
                "y": 769
              }
            },
            {
              "ratio": 1,
              "lt_point": {
                "x": 65,
                "y": 12
              },
              "rb_point": {
                "x": 1135,
                "y": 1439
              }
            }
          ],
          "tag_info": {
            "is_long_picture": false
          },
          "template_info": null,
          "image_id": "126528681"
        },
        {
          "url": "", // required for embed
          "height": 1440,
          "width": 2560,
          "format": "JPEG",
          "size": "541337",
          "spoiler": false,
          "cuts": [
            {
              "ratio": 1,
              "lt_point": {
                "x": 0,
                "y": 486
              },
              "rb_point": {
                "x": 461,
                "y": 1101
              }
            },
            {
              "ratio": 2,
              "lt_point": {
                "x": 0,
                "y": 486
              },
              "rb_point": {
                "x": 461,
                "y": 832
              }
            },
            {
              "ratio": 3,
              "lt_point": {
                "x": 0,
                "y": 486
              },
              "rb_point": {
                "x": 461,
                "y": 947
              }
            },
            {
              "ratio": 4,
              "lt_point": {
                "x": 0,
                "y": 486
              },
              "rb_point": {
                "x": 461,
                "y": 745
              }
            }
          ],
          "tag_info": {
            "is_long_picture": false
          },
          "template_info": null,
          "image_id": "126528695"
        }
      ],
      "cut_type": 1,
      "shows_game_classification": false,
      "vote": null,
      "hot_reply_v2": null,
      "feedback": null,
      "reply_quick_source": [],
      "trans_source": "AWSTranslate",
      "ugc_module": null
    },
    "post_detail_redirection_info": null,
    "game_version_cards": []
  }
}
```

For this to work we will need the `post_id`, from that we can get the following:

> data -> post -> post -> {subject (title), desc, nickname, avatar_url, image_list[] (contains multiple images)}

From there wem parse the Embed in this format:

```jsonc
{
  "embeds": [
    {
      "author": {
        "name": "nickname",
        "icon_url": "avatar_url"
      },
      "title": "subject",
      "description": "desc",
      "image": {
        "url": "image_list[]"
      },
      "url": "long_link_url",
      "color": 8811744
    },
    {
      "url": "long_link_url",
      "image": {
        "url": "image_list[]"
      }
    }
  ]
}
```

Note: This just a concept, refer to the final version for more information

### Mutiple type of Posts

HoYoLAB have different post types:

1. Regular Post: A normal blog type of post
2. Image Post: An image only post
3. Video Post: A video only post. With 3 valid domains: YouTube, TikTok, and HoYoLAB CDN (used by HoYoverse internal staff)
4. Genius Column: Same as Regular Post but contains Miliastra Wonderland Level Data. Post made using this type will also synced with Genshin Impact's Miliastra Wonderland Genius Column Section in-game.

- For Regular Post, we only need the title, description and the post author name and profile avatar. If the post have images, we will add a gallery into it using `image_list`. Additionally, if a post have `has_cover=true`, use `cover_list` instead `image_list`. Easy indication to detect if a post is a Regular Post type is to check `view_type`. Regular Post: `view_type=1`

  - Note: Image List is not required. Only render when avaliable, or use Cover List instead if `has_cover=true`. Otherwise, only Title, Description, Author Profile Avatar and Profile Name is required.

- Image Post is no different from Regular Post. Only requires Title, Description, Author Profile Avatar, Profile Name, and Image List. Image Post: `view_type=2`

- Video Post works differently, besides needing the neccessary stuff (title, description and the post author name and profile avatar), in the json dictionary (data -> post -> post), there's a section for video (data -> post -> video), which contains cover image and the original link. Currently post with YouTube Link or from HoYoLAB CDN. Post with TikTok Videos are not sharable. Video Post: `view_type=5`

  - When video using YouTube Link, only set the image cover as the cover (data -> post -> video -> cover). If the video was from HoYoLAB CDN, replace the cover with the actual video instead (data -> post -> video -> resolution -> url) or (data -> post -> video -> url).

Example JSON file with HoYoLAB Video

```jsonc
{
  "retcode": 0,
  "message": "OK",
  "data": {
    "post": {
      "video": {
        "id": "472614",
        "cover": "https://vod-static.hoyolab.com/4/2025-05-03/transcoded/141918710044165853184_captions.0000000.jpg",
        "url": "https://vod-static.hoyolab.com/4/2025-05-03/transcoded/141918710044165853184_1080p.mp4",
        "is_vertical": false,
        "sub_type": 2,
        "resolution": [
          {
            "name": "default",
            "height": "1080",
            "width": "1920",
            "url": "https://vod-static.hoyolab.com/4/2025-05-03/transcoded/141918710044165853184_1080p.mp4",
            "duration": "26"
          }
        ],
        "status": "published",
        "cover_meta": {
          "url": "https://vod-static.hoyolab.com/4/2025-05-03/transcoded/141918710044165853184_captions.0000000.jpg",
          "height": 1080,
          "width": 1920,
          "format": "",
          "size": "0",
          "spoiler": false
        }
      }
    }
  }
}
```

Example JSON file with YouTube Embed:

```jsonc
{
  "retcode": 0,
  "message": "OK",
  "data": {
    "post": {
      "video": {
        "id": "ISGtWDLPn84",
        "cover": "https://i.ytimg.com/vi/ISGtWDLPn84/hqdefault.jpg",
        "url": "https://www.youtube.com/embed/ISGtWDLPn84",
        "is_vertical": true,
        "sub_type": 0,
        "resolution": [],
        "status": "transcoding",
        "cover_meta": null
      }
    }
  }
}
```

- Lastly, the Genius Column, introduced with Genshin Impact's Miliastra Wonderland. This post type allow users to share their favorite Wonderland Levels in HoYoLAB. It works similar to Regular Post but contains an additional data.

```jsonc
{
  "retcode": 0,
  "message": "OK",
  "data": {
    "post": {
      "ugc_module": {
        "ugc_levels": [
          {
            "level_id": "7777129670",
            "level": {
              "level_id": "7777129670",
              "region": "os_asia",
              "level_name": "Daydream",
              "cover": {
                "url": "https://asia-ugc-upload.hoyoverse.com/ugcprodasia/image/os_asia/54031550621807/20251024/bda38848-5f22-42b2-b6b1-26e31535f5a6.png?auth_key=1763302102-ba32abe21149b552-0-d535e7b7c444dcc14ec0b33530a3de0c"
              },
              "desc": "",
              "limit_play_num_min": 1,
              "limit_play_num_max": 8,
              "play_type": "Desafío de supervivencia",
              "good_rate": "99.3%",
              "hot_score": "11.4k",
              "creator_uid": "862034251",
              "interact_info": {
                "has_fav": false
              },
              "level_attachment": {
                "type": "CARD_ATTACHMENT_REPLY",
                "content": "is the creator a teapot main cuz the map is beautiful. please add somewhere to sit so we can stay longer and please do expand the map"
              },
              "user_play_info": {
                "has_played": false,
                "played_time": "0",
                "played_count": 0
              },
              "extra": {
                "play_link": [],
                "friends_played": false,
                "friends_played_list": [],
                "first_online_time": "0"
              },
              "level_info_has_released": true,
              "level_source_type": "LEVEL_SOURCE_TYPE_DEFAULT",
              "data_box": "",
              "show_limit_play_num_str": "1-8",
              "level_intro": ""
            }
          }
        ],
        "user_game_info": {
          "game_uid": "880970807",
          "game_region": "os_asia",
          "nick_name": "Chara",
          "avatar": "",
          "level": 0,
          "game_region_name": "Asia Server"
        },
        "author_game_role_info": {
          "is_level_creator": false,
          "is_game_friend": false
        },
        "author_level_record": {
          "level_id": "7777129670",
          "rank": {
            "rank": 0,
            "rank_type": 0,
            "is_show": false
          },
          "tier": {
            "tier_star_cnt": 0,
            "tier_icon_url": "",
            "tier_color": "",
            "is_show": false
          }
        },
        "ugc_tags": [],
        "ugc_levels_count": 1
      }
    }
  }
}
```

- Taking from my past project "Wonderland Explorer Discord Bot", we can add 2 links into our description section. "Open in Genshin" and "View Level in HoYoLAB". Initally, I was thinking of using the Level's Image Cover to post that but the image cover uses a CDN based auth key which expires in 24 hours and because there's also images in the post so we ignored pull image data from Level Data itself. To make the link works, we need 2 data, the `level_id` and `region`. Likewise, valid regions are `os_usa` (America), `os_asia` (Asia), `os_euro` (Europe) and `os_cht` (TW/Hk/MO).

Example Embed Data:

```jsonc
{
  "embeds": [
    {
      "title": "Post_Title",
      "thumbnail": {
        "url": ""
      },
      "image": {
        "url": ""
      },
      "fields": [
        {
          "name": "Level_Name",
          "value": "- [Open in Genshin](https://link.studiobutter.io.vn/ugc/wonderland?ugc_id=[level_id]&server=[region])\n- [View Level](https://act.hoyolab.com/ys/ugc_community/mx/#/pages/level-detail/index?id=[level_id]&region=[region])"
        }
      ],
      "description": "Post_Description"
    }
  ]
}
```

Note: Image_list is optional, only render when it's avaliable. Cover List also apply when avaliable if `has_cover=true`

## How does a short link work?

Like I said, there's 3 types of short links. But we only need to target 2 types, the regular short link, starts with `https://hoyo.link/` that has a random string and the link with `?q=`.

These links usually have anything. But we only want to detect if the Link is a HoYoLAB link (https://www.hoyolab.com).

So we need to add a check to see if it's a HoYoLAB link or not, if it's true, we can start parsing the data. Otherwise, if the link is a download link, a Google Drive Link, Web Event, etc, we just use the same embed data the website use instead.

- If HoYoLAB link is: https://www.hoyolab.com/article_pre/[pre_post_id]

  - We will need to get the actual ID of the original post from this URL: https://bbs-api-os.hoyolab.com/community/post/wapi/getPostID?id=[pre_post_id]

  - Pre Post ID Response:

  ```jsonc
  {
    "retcode": 0,
    "message": "OK",
    "data": {
      "post_id": "42680980",
      "post": null
    }
  }
  ```

  - We can then parse the data from there using the Parsed Data URL

- If HoYoLAB link is: https://www.hoyolab.com/article/[post_id]

  - We can simply render the Embed from the Post ID directly.

Finally, there's the `?q=` link.

- When a `?q=[query_id]` link get passed, query the `q` payload using this link: `https://bbs-api-os.hoyolab.com/community/misc/api/transit?q=[query_id]`

- From there it returns this URL: `https://sg-public-api.hoyolab.com/event/social_sea_share/redirectUrl?url=https://m.hoyolab.com/%23/article/[post_id]/?lang%3Den-us%26utm_source%3Dsns%26utm_medium%3Dlink&img_url=[cover_img]&title=[title]`

- The Return link contains the URL that will get redirected, the image cover and the title of the post. We only need the Redirected URL, and from that, we only need the `post_id`.

- From there, we parse the post data from `post_id`.

## Requirements

When user pass the Parsed Data URL, some post will render correctly. But not all. To solve it, we will need to pass this request header so all post will work: `x-rpc-app_version: 4.0.0`

## Enhancement

### Multi-Language support and regional only post

For certain post, especially post comes from Official accounts, will usually have more than one language. Some of the post may not be available in English. For that we need to figure how to handle:

- Multi language post
- Regional Only Post

#### Multi-language support

This is easy is what I would say. But by default, the link renders in English and it's the default fall back language.

To configure language support, the parsed data url will need to pass this header data: `x-rpc-language:`, default and fallback is `en-us`.

From the user's end, user can then add `lang=[supported_lang]` in the Embed Fixed URL. If the language isn't avaliable, the parsed data will fallback to English by default or whatever language is avaliable for that post.

#### Regional Only post support

Like said before, certain post may not have English as the default language for the post. When the data get parsed, it will use the avaliable language the post has.

Example:

```jsonc
{
  "retcode": 0,
  "message": "OK",
  "data": {
    "post": {
      "post": {
        "game_id": 2,
        "post_id": "41364306",
        "f_forum_id": 0,
        "uid": "1015537",
        "subject": "《納塔異世饗宴》活動大公開！",
        "content": "",
        "cover": "",
        "view_type": 1,
        "created_at": 1758881403,
        "images": [],
        "post_status": {
          "is_top": false,
          "is_good": false,
          "is_official": false,
          "is_vote": false,
          "is_quiz_vote": false,
          "is_demoted": false,
          "is_hot": false
        },
        "topic_ids": [],
        "view_status": 1,
        "max_floor": 72,
        "is_original": 1,
        "republish_authorization": 2,
        "reply_time": "2025-10-27 07:13:58",
        "is_deleted": 0,
        "is_interactive": false,
        "structured_content": "[]",
        "structured_content_rows": [],
        "lang": "zh-tw",
        "official_type": 3,
        "reply_forbid": {
          "date_type": 0,
          "start_date": "0",
          "cur_date": "0",
          "level": 0
        },
        "video": "",
        "contribution_id": "0",
        "event_start_date": "0",
        "event_end_date": "0",
        "classification_id": "25",
        "is_audit": false,
        "is_multi_language": true,
        "origin_lang": "zh-tw",
        "sub_type": 0,
        "reprint_source": "",
        "can_edit": true,
        "last_modify_time": 0,
        "multi_language_info": {
          "langs": ["zh-tw"],
          "future_post_id": "20622",
          "lang_subject": {
            "zh-tw": "《納塔異世饗宴》活動大公開！"
          },
          "lang_content": {},
          "lang_structured_content": {}
        },
        "visible_level": 1,
        "has_cover": false,
        "suid": "0",
        "desc": "旅行者！ 《原神》x《全家FamilyMart》聯動活動即將展開，與瑪拉妮、卡齊娜一起，到全家來場納塔異世饗宴吧！\" 聯動活動期間，不僅有限定包裝與周邊登場，還有機會獲得特殊道具「新式終端浮葉型」。 今年10月，「《原神》，啟動」就在全家！ ➤活動時間：2025年10月1日 - 2025年10月28日 ➤活動內容： ✦全新限定聯動包裝，啟動✦ 「Let's Café」、「Let's Tea」、「經典黑炫酷繽沙(牛奶/咖啡)」、「哈逗堡」、「泰山冰鎮檸檬紅茶」、「泰山冰鎮水果茶」、「立頓萃香奶綠」及「立頓英式奶茶」等商品將推出全新《原神》聯動包裝，快來一場異世饗宴之旅吧！",
        "game_uid": "0",
        "game_region": ""
      },
      "forum": null,
      "topics": [],
      "user": {
        "uid": "1015537",
        "nickname": "Genshin Impact Official",
        "introduce": "Grand Master of Genshin Impact Forum",
        "avatar": "100236",
        "gender": 0,
        "certification": {
          "type": 1,
          "icon_url": "https://hyl-static-res-prod.hoyolab.com/upload/static-resource/2022/02/23/f5a37763f0f2080c0c43cca8638af024_5295925290813405198.webp",
          "desc": "Official Big Boss"
        },
        "level_exp": {
          "level": 0,
          "exp": 0
        },
        "is_following": true,
        "is_followed": false,
        "avatar_url": "https://fastcdn.hoyoverse.com/static-resource-v2/2024/04/10/71a62b9a993534f3db7896fc6f725ff8_4436020059642725994.webp",
        "auth": null,
        "is_logoff": false,
        "pendant": "",
        "was_following": false,
        "post_num": 4016,
        "suid": "0",
        "black_relation": {
          "is_blacking": false,
          "is_blacked": false
        },
        "badge": null,
        "lantern": null,
        "otaku_devotion_title": {
          "icon": "",
          "name": "",
          "desc": "",
          "otaku_identity": "OtakuIdentityNone",
          "accompany_title": "AccompanyTitleUnknown",
          "role_id": "0"
        },
        "allow_community": true,
        "content_cannot_be_upvoted": false,
        "content_cannot_be_replied": false,
        "post_cannot_be_shared": false,
        "post_cannot_be_collected": false,
        "cannot_be_followed": false
      },
      "self_operation": {
        "attitude": 0,
        "is_collected": false
      },
      "stat": {
        "view_num": 45331,
        "reply_num": 166,
        "like_num": 674,
        "bookmark_num": 276,
        "share_num": 285,
        "view_num_unit": "",
        "reply_num_unit": "",
        "like_num_unit": "",
        "bookmark_num_unit": "",
        "share_num_unit": "",
        "true_view_num": 0,
        "click_view_num": 0,
        "summary_for_creator": null,
        "multi_upvote_stats": [],
        "self_operation": null,
        "expose_view_num": 0
      },
      "help_sys": null,
      "cover": null,
      "image_list": [],
      "is_official_master": false,
      "is_user_master": false,
      "hot_reply_exist": true,
      "vote_count": 0,
      "last_modify_time": 0,
      "contribution": null,
      "classification": {
        "id": "25",
        "name": "Game News & suggestions",
        "icon": ""
      },
      "video": null,
      "game": {
        "game_id": 2,
        "game_name": "Genshin Impact",
        "color": "#7D6631",
        "background_color": "#F3E9C8",
        "icon": ""
      },
      "data_box": "",
      "is_top_icon": false,
      "tags": {
        "is_user_top": false,
        "is_qualified_post": true,
        "is_hot_entry_post": false,
        "hot_topic_idx": 0,
        "is_doujin_force_post": false,
        "is_exclusive": false,
        "is_show_official_channel_jump": false
      },
      "hot_reply": null,
      "collection": null,
      "is_rich_text": false,
      "catalog_style_hint": 0,
      "cover_list": [],
      "cut_type": 2,
      "shows_game_classification": false,
      "vote": null,
      "hot_reply_v2": null,
      "feedback": null,
      "reply_quick_source": [],
      "trans_source": "AWSTranslate",
      "ugc_module": null
    },
    "post_detail_redirection_info": null,
    "game_version_cards": []
  }
}
```

## Getting it setup for Embed Fixing (General User)

Example URL: fxhyl.example.com

Short Link Query: fxhyl.example.com/sh?q=[query_id]

Short Link: fxhyl.example.com/sh?redirect=[short_link_id]

Long Link: fxhyl.example.com/post?post_id=[post_id]

## Getting it setup for Embed Fixing (Discord Bot)

For Discord Bot Developers, it's recommend that you handle this from the bot end instead of from the server end. As long you can get the `post_id` from the long link or short link, you can then pass it through the Long Link Fix URL directly. Besides that, if you want to, you can also reveal the Short Link actual original link if the short link does not redirect to HoYoLAB but to another website.

For discord.py using Jishaku, you can run this command to test it out. The Bot will print out in the terminal, not in the channel. Sorry

[bot_tag] jsk py

```python
import aiohttp

# Replace this with your shortened link
target_link = "https://hoyo.link/v1xJyPgfc"

async with aiohttp.ClientSession() as session:
    async with session.get(target_link) as response:
        # response.url is the final destination after redirects
        final_url = str(response.url)

        # response.history shows the chain of redirects (optional info)
        history = [str(r.url) for r in response.history]

print(f"Short link: {target_link}")
print(f"Redirect chain: {history}")
print(f"Final Destination: {final_url}")
```

## Final thoughts

This is the end of the documentation. Hope this help HoYo enthusiast bot devs to work on something like this or use this as reference for one of your future projects. By the time I write this documentation, I might have start working on this project, as such, I hope to see what you will work on.
