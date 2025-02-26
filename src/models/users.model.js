const{ Schema, Types } = require("mongoose");
const mongoose = require("mongoose");
const userSchema = new mongoose.Schema(
  {
    name: {
      //username
      type: String,
      trim: true,
    },
    email: {
      //useremail
      type: String,
      required: [true, "Please enter your email!"],
      trim: true,
      unique: true,
    },
    password: {
      //password
      type: String,
      required: [true, "Please enter your password!"],
    },
    role: {
      //role
      type: Number,
      default: 0, // 0 = free user, -1 = admin, else supporters
    },
    avatar: {
      //avatar
      type: String,
      default: "uploads/1730803174030-avatar.gif",
    },
    characterType: {
      //character type
      type: String,
      required: [true, "Please select the character type"],
    },
    description: {
      //user bio
      type: String,
      maxlength: 450,
    },
    aimName: {
      //discord name
      type: String,
    },
    youtube: {
      //ubute link
      youtube: {
        type: String,
      },
      enableYoutube: {
        type: Boolean,
        default: false,
      },
      autoYoutube: {
        type: Boolean,
        default: false,
      },
    },
    blocks: {
      //block users
      type: [{ type: Types.ObjectId, ref: "Users" }],
      default: [],
    },
    money: {
      //money -> every round initialize
      type: Number,
      default: 50_000_000,
    },
    turn: {
      //turn -> every round initialize
      type: Number,
      default: 7000,
    },
    level: {
      //level -> every round initialize
      type: Number,
      default: 1,
    },
    recruits: {
      //recruits->every round initialize
      type: Number,
      default: 200,
    },
    lastSeen: {
      //last seen
      type: Date,
    },
    cycleRewards: {
      type: Number,
      default: 200 * 83,
    },
    netWorth: {
      //round score
      type: Number,
      default: 0,
    },
    rank: {
      //round rank
      type: Number,
      required: true,
      default: 1,
    },
    items: {
      //items every round initialize
      type: [
        {
          count: {
            type: Number,
          },
          item: {
            type: Schema.Types.ObjectId,
            ref: "items",
          },
        },
      ],
      default: [],
    },
    medals: {
      //medals
      type: [
        {
          count: {
            type: Number,
          },
          medal: {
            type: Schema.Types.ObjectId,
            ref: "medals",
          },
        },
      ],
      default: [],
    },
    grade: {
      //grade 0-5: general etc...every round initialize
      type: Number,
      required: true,
      default: 0,
    },
    crew: {
      //crew every round initialize
      type: Schema.Types.ObjectId,
      ref: "crews",
      default: null,
    },
    points: {
      type: Number,
      required: true,
      default: 0,
    },
    bankedTurn: {
      //banked turn
      type: Number,
      required: true,
      default: 0,
    },
    lastLeaveCrew: {
      //crew initialization
      type: Date,
      default: null,
    },
    strength: {
      //strength every round initialize
      type: Number,
      default: 100,
    },
    str1: {
      //every round initialize
      type: Number,
      default: 100,
    },
    str2: {
      //every round initialize
      type: Number,
      default: 100,
    },
    str3: {
      //every round initialize
      type: Number,
      default: 100,
    },
    str4: {
      //every round initialize
      type: Number,
      default: 100,
    },
    str5: {
      //every round initialize
      //homeleave
      type: Number,
      default: 100,
    },
    troops: {
      //every round initialize
      type: Number,
      default: 0,
      required: true,
    },
    ab1: {
      //every round initialize
      type: Number,
      default: 0,
    },
    ab2: {
      //every round initialize
      type: Number,
      default: 0,
    },
    ab3: {
      //every round initialize
      type: Number,
      default: 0,
    },
    ab4: {
      //every round initialize
      type: Number,
      default: 0,
    },
    ab5: {
      //every round initialize
      type: Number,
      default: 0,
    },
    att_win: {
      //every round initialize
      type: Number,
      default: 0,
    },
    att_lose: {
      //every round initialize
      type: Number,
      default: 0,
    },
    def_win: {
      //every round initialize
      type: Number,
      default: 0,
    },
    def_lose: {
      //every round initialize
      type: Number,
      default: 0,
    },
    damage: {
      //every round initialize
      type: Number,
      default: 0,
    },
    lastActivity: {
      //every round initialize
      type: String,
      default: null,
    },
    unreadAttack: {
      //every round initialize
      type: Number,
      default: 0,
    },
    lastAttackedBy: {
      //every round initialize
      type: Schema.Types.ObjectId,
      ref: "Users",
    },
    lastAttack: {
      //every round initialize
      type: Schema.Types.ObjectId,
      ref: "Users",
    },
    lastAttackedTime: {
      //every round initialize
      type: Date,
    },
    lastAttackTime: {
      //every round initialize
      type: Date,
    },
    transferedTurns: {
      //every round initialize
      type: Number,
      default: 0,
    },
    unreadCrewBoard: {
      type: Number,
      default: 0,
    },
    spent: {
      type: Number,
      default: 0,
    },
    currentRoundSpent: {
      type: Number,
      default: 0,
    },
    isSupporter: {
      type: Boolean,
      default: false,
    },
    isHelper: {
      type: Boolean,
      default: false,
    },
    hasRound: {
      type: Boolean,
      default: false,
    },
    achievements: [
      {
        type: Types.ObjectId,
        ref: "achievements"
      },
    ],
    dailySnippingAmount: {
      type: Number,
      default: 0
    },
    lastSnipping: {
      type: Date,
      default: null
    },
    casinoTurn: {
      type: Number,
      default: 0
    },
    gold: {
      type: Number,
      default: 0
    },
    ips: {
      type: [
        {
          type: String
        }
      ],
      default: []
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Users", userSchema);
