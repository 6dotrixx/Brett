// Bank B — Dwelling Policy, Homeowners Policy, Auto Insurance
window.BANK_B = [
  // ---------- Dwelling Policy ----------
  {
    s: "Dwelling Policy",
    q: "The DP-1 Basic Form automatically covers which perils without endorsement?",
    c: [
      "Fire, lightning, and internal explosion",
      "All risks of direct physical loss",
      "Theft and vandalism",
      "Windstorm, hail, and riot"
    ],
    a: 0,
    e: "DP-1 covers only fire, lightning, and internal explosion; extended coverage perils (windstorm, hail, riot, etc.) and V&MM must be added by endorsement."
  },
  {
    s: "Dwelling Policy",
    q: "Which dwelling form covers the dwelling itself on an open peril (special) basis?",
    c: ["DP-3", "DP-1", "DP-2", "None — all dwelling forms are named peril"],
    a: 0,
    e: "The DP-3 Special Form insures the dwelling and other structures on an open peril basis; personal property remains broad named peril."
  },
  {
    s: "Dwelling Policy",
    q: "Under a dwelling policy, Coverage B (Other Structures) is automatically provided at what percentage of Coverage A?",
    c: ["10%", "50%", "25%", "5%"],
    a: 0,
    e: "Coverage B for detached structures is an additional 10% of the Coverage A dwelling limit (in DP-1 it is part of, not in addition to, Coverage A)."
  },
  {
    s: "Dwelling Policy",
    q: "Which coverage pays the rental value of the portion of the dwelling rented to others after a covered loss?",
    c: ["Coverage D — Fair Rental Value", "Coverage C — Personal Property", "Coverage E — Additional Living Expense", "Coverage B — Other Structures"],
    a: 0,
    e: "Coverage D pays fair rental value when a covered loss makes the rented portion unfit; Coverage E pays the owner-occupant's additional living expenses."
  },
  {
    s: "Dwelling Policy",
    q: "Which statement about the standard unendorsed dwelling policy is TRUE?",
    c: [
      "It provides no theft coverage and no personal liability coverage",
      "It automatically includes personal liability",
      "It covers theft of contents up to $1,500",
      "It requires the owner to occupy the dwelling"
    ],
    a: 0,
    e: "Dwelling forms exclude theft and contain no liability coverage; both may be added by endorsement. Owner occupancy is not required — rentals are eligible."
  },
  {
    s: "Dwelling Policy",
    q: "Dwelling policies are designed for residential buildings with no more than:",
    c: ["Four residential units", "One residential unit", "Two residential units", "Six residential units"],
    a: 0,
    e: "Eligible dwellings may contain up to four residential units (and up to five roomers or boarders)."
  },
  {
    s: "Dwelling Policy",
    q: "Additional Living Expense (Coverage E) is NOT included in which dwelling form?",
    c: ["DP-1 Basic", "DP-2 Broad", "DP-3 Special", "It is included in all three forms"],
    a: 0,
    e: "The DP-1 provides fair rental value only; Additional Living Expense is included in the DP-2 and DP-3 (it can be endorsed onto a DP-1)."
  },
  {
    s: "Dwelling Policy",
    q: "Under the DP-2 and DP-3, losses to the dwelling are settled on what basis if the coinsurance-style insurance-to-value requirement is met?",
    c: ["Replacement cost", "Actual cash value only", "Market value", "Agreed value"],
    a: 0,
    e: "DP-2 and DP-3 settle building losses at replacement cost when insured to at least 80% of value; DP-1 settles at actual cash value."
  },

  // ---------- Homeowners Policy ----------
  {
    s: "Homeowners Policy",
    q: "Under the HO-3 Special Form, the dwelling is covered on a(n) __________ basis and personal property on a(n) __________ basis.",
    c: ["Open peril; broad named peril", "Named peril; open peril", "Open peril; open peril", "Basic named peril; broad named peril"],
    a: 0,
    e: "HO-3 insures the dwelling and other structures against open perils, while personal property is covered for broad-form named perils."
  },
  {
    s: "Homeowners Policy",
    q: "Which homeowners form provides open peril coverage on BOTH the dwelling and personal property?",
    c: ["HO-5", "HO-2", "HO-3", "HO-8"],
    a: 0,
    e: "The HO-5 Comprehensive Form covers both the dwelling and contents on an open peril basis."
  },
  {
    s: "Homeowners Policy",
    q: "Which form is designed for a tenant who rents an apartment?",
    c: ["HO-4", "HO-6", "HO-3", "HO-8"],
    a: 0,
    e: "The HO-4 Contents Broad Form covers a tenant's personal property and loss of use — no dwelling coverage is needed."
  },
  {
    s: "Homeowners Policy",
    q: "The HO-8 Modified Form is most appropriate for:",
    c: [
      "An older home whose replacement cost far exceeds its market value",
      "A newly built luxury home",
      "A condominium unit owner",
      "A renter with valuable jewelry"
    ],
    a: 0,
    e: "The HO-8 settles losses on a functional replacement cost / market value basis, suiting older homes where full replacement cost is impractical."
  },
  {
    s: "Homeowners Policy",
    q: "Under an HO-3, if Coverage A is $300,000, the standard Coverage C (personal property) limit is:",
    c: ["$150,000 (50% of A)", "$30,000 (10% of A)", "$90,000 (30% of A)", "$300,000 (100% of A)"],
    a: 0,
    e: "For an HO-2, HO-3, or HO-5, Coverage C defaults to 50% of Coverage A; Coverage B is 10% and Coverage D is 30%."
  },
  {
    s: "Homeowners Policy",
    q: "Coverage F (Medical Payments to Others) in a homeowners policy pays:",
    c: [
      "Medical expenses of guests injured on the premises, regardless of fault",
      "Medical expenses of the named insured",
      "Medical expenses of resident family members",
      "Only losses the insured is legally liable for"
    ],
    a: 0,
    e: "Coverage F pays necessary medical expenses of others (not insureds or regular residents) without regard to fault."
  },
  {
    s: "Homeowners Policy",
    q: "Under homeowners special limits of liability, theft of jewelry, watches, and furs is limited to:",
    c: ["$1,500", "$200", "$5,000", "$2,500"],
    a: 0,
    e: "Theft of jewelry, watches, and furs is capped at $1,500 in aggregate; money is limited to $200. Scheduling items removes these limits."
  },
  {
    s: "Homeowners Policy",
    q: "Section I of a homeowners policy provides:",
    c: ["Property coverages (A, B, C, D)", "Liability coverages (E and F)", "Medical payments only", "Workers compensation"],
    a: 0,
    e: "Section I contains the property coverages; Section II contains Coverage E (personal liability) and Coverage F (medical payments to others)."
  },
  {
    s: "Homeowners Policy",
    q: "To be eligible for a standard homeowners policy, a dwelling must be:",
    c: [
      "Owner-occupied with no more than four families",
      "Occupied by tenants only",
      "A commercial building with incidental residence",
      "Valued under $500,000"
    ],
    a: 0,
    e: "Homeowners forms require owner occupancy of a one- to four-family dwelling (HO-4 covers tenants; HO-6 covers unit owners)."
  },
  {
    s: "Homeowners Policy",
    q: "Which peril is excluded under an unendorsed homeowners policy?",
    c: ["Flood", "Lightning", "Windstorm", "Theft"],
    a: 0,
    e: "Flood, earth movement, ordinance or law, war, nuclear hazard, neglect, and intentional loss are excluded; flood requires a separate NFIP or private policy."
  },
  {
    s: "Homeowners Policy",
    q: "To collect full replacement cost on a partial dwelling loss under an HO-3, the insured must carry insurance of at least:",
    c: ["80% of the dwelling's replacement cost", "100% of market value", "50% of replacement cost", "90% of actual cash value"],
    a: 0,
    e: "The replacement cost condition requires insurance equal to at least 80% of replacement cost at the time of loss; otherwise a penalty formula applies."
  },
  {
    s: "Homeowners Policy",
    q: "The Scheduled Personal Property endorsement provides:",
    c: [
      "Open peril coverage on listed valuables, typically with no deductible",
      "Named peril coverage subject to the policy deductible",
      "Liability coverage for valuable items",
      "Coverage only while items are at home"
    ],
    a: 0,
    e: "Scheduling items (jewelry, furs, cameras, fine arts, etc.) provides agreed-amount, open peril coverage, usually with no deductible, worldwide."
  },
  {
    s: "Homeowners Policy",
    q: "An HO-6 unit-owners form is primarily designed to cover:",
    c: [
      "The unit owner's personal property plus interior walls, additions and alterations",
      "The entire condominium building",
      "Common areas owned by the association",
      "Only loss assessments"
    ],
    a: 0,
    e: "The condo association's master policy covers the building; the HO-6 covers the unit owner's contents and 'walls-in' items like fixtures, additions, and alterations."
  },
  {
    s: "Homeowners Policy",
    q: "Which activity is generally excluded under Section II of a homeowners policy?",
    c: ["Business pursuits of the insured", "A neighbor's child injured on the insured's trampoline", "The insured's dog biting a guest", "Damage the insured negligently causes to a neighbor's fence"],
    a: 0,
    e: "Liability arising out of business pursuits and professional services is excluded (limited incidental exceptions exist); personal negligence claims are covered."
  },
  {
    s: "Homeowners Policy",
    q: "The homeowners Loss Assessment additional coverage pays up to what amount for the insured's share of an association assessment from a covered loss?",
    c: ["$1,000", "$500", "$5,000", "$10,000"],
    a: 0,
    e: "The policy automatically includes $1,000 of loss assessment coverage; higher limits can be purchased by endorsement."
  },

  // ---------- Auto Insurance ----------
  {
    s: "Auto Insurance",
    q: "In the Personal Auto Policy, which part provides liability coverage?",
    c: ["Part A", "Part B", "Part C", "Part D"],
    a: 0,
    e: "Part A is liability, Part B is medical payments, Part C is uninsured motorists, and Part D is coverage for damage to your auto."
  },
  {
    s: "Auto Insurance",
    q: "Arizona's minimum motor vehicle liability limits are:",
    c: [
      "$25,000/$50,000 bodily injury and $15,000 property damage",
      "$15,000/$30,000 bodily injury and $10,000 property damage",
      "$50,000/$100,000 bodily injury and $25,000 property damage",
      "$30,000/$60,000 bodily injury and $15,000 property damage"
    ],
    a: 0,
    e: "Arizona minimum financial responsibility limits are $25,000 per person / $50,000 per accident bodily injury and $15,000 property damage."
  },
  {
    s: "Auto Insurance",
    q: "Under Part A of the PAP, who is an 'insured' while using the named insured's covered auto?",
    c: [
      "The named insured, resident family members, and any person using the auto with permission",
      "Only the named insured",
      "Only drivers listed on the declarations",
      "Anyone driving the auto, even a thief"
    ],
    a: 0,
    e: "Insureds include the named insured and family members for any auto, plus any person using the covered auto with a reasonable belief of permission."
  },
  {
    s: "Auto Insurance",
    q: "The insured's car strikes a deer. Under Part D of the PAP this loss is paid under:",
    c: ["Other-than-collision (comprehensive) coverage", "Collision coverage", "Part A liability", "Uninsured motorist property damage"],
    a: 0,
    e: "Contact with a bird or animal, along with fire, theft, glass breakage, falling objects, flood, and vandalism, is other-than-collision."
  },
  {
    s: "Auto Insurance",
    q: "Uninsured motorist coverage (Part C) pays for:",
    c: [
      "Bodily injury to insureds caused by an uninsured or hit-and-run driver",
      "Damage to the insured's auto from any accident",
      "The other driver's injuries",
      "The insured's liability when driving uninsured"
    ],
    a: 0,
    e: "UM coverage pays compensatory damages for bodily injury the insured is legally entitled to recover from an uninsured or hit-and-run motorist."
  },
  {
    s: "Auto Insurance",
    q: "In Arizona, insurers writing auto liability must offer UM and UIM coverage:",
    c: [
      "In writing, with limits equal to the liability limits; the insured may select lower limits or reject it",
      "Only when liability limits exceed $100,000",
      "Automatically with no right of rejection",
      "Only on commercial policies"
    ],
    a: 0,
    e: "Arizona insurers must make a written offer of UM/UIM at limits equal to liability; the named insured may accept, select lower limits, or reject in writing."
  },
  {
    s: "Auto Insurance",
    q: "Part B (Medical Payments) of the PAP covers reasonable medical expenses incurred within what period after an accident?",
    c: ["3 years", "1 year", "90 days", "5 years"],
    a: 0,
    e: "Med pay covers necessary medical and funeral expenses sustained in an accident and incurred within 3 years, regardless of fault."
  },
  {
    s: "Auto Insurance",
    q: "For a newly acquired auto to have automatic Part D coverage when no other vehicle on the policy carries Part D, the insured must ask the insurer to insure it within:",
    c: ["4 days", "14 days", "30 days", "60 days"],
    a: 0,
    e: "A newly acquired auto has automatic OTC/collision coverage for 4 days if no declared auto has Part D; 14 days applies when an existing auto already carries that coverage."
  },
  {
    s: "Auto Insurance",
    q: "Which use is excluded under the Personal Auto Policy?",
    c: [
      "Carrying passengers for a fee (public livery)",
      "Driving to work in a carpool with shared expenses",
      "Running personal errands",
      "A family member borrowing the car"
    ],
    a: 0,
    e: "Public or livery conveyance (including most ride-sharing while logged in, absent an endorsement) is excluded; share-the-expense carpools are fine."
  },
  {
    s: "Auto Insurance",
    q: "Under PAP supplementary payments, the policy pays up to how much for bail bonds required because of a covered accident?",
    c: ["$250", "$100", "$500", "$1,000"],
    a: 0,
    e: "Supplementary payments include up to $250 for bail bonds and up to $200 per day for loss of earnings due to attending trials — in addition to the liability limit."
  },
  {
    s: "Auto Insurance",
    q: "After a covered theft of the insured's auto, transportation expense coverage under the PAP pays:",
    c: ["$20 per day up to a $600 maximum", "$50 per day with no maximum", "$10 per day up to $300", "Nothing unless endorsed"],
    a: 0,
    e: "Transportation expenses are paid at $20/day up to $600 for a total theft (after a 48-hour wait), or when the insured is otherwise legally liable for a rental."
  },
  {
    s: "Auto Insurance",
    q: "Once an Arizona personal auto policy has been in force for 60 days, the insurer may cancel midterm ONLY for reasons such as:",
    c: [
      "Nonpayment of premium, license suspension, or material misrepresentation/fraud",
      "Any reason, with 10 days notice",
      "The insured filing one not-at-fault claim",
      "A general rate increase"
    ],
    a: 0,
    e: "After the 60-day underwriting window, midterm cancellation is restricted to statutory grounds like nonpayment, fraud, or driver's license suspension."
  },
  {
    s: "Auto Insurance",
    q: "In the Business Auto Coverage Form, covered auto symbol 1 means:",
    c: ["Any auto", "Owned autos only", "Specifically described autos", "Hired autos only"],
    a: 0,
    e: "Symbol 1 = any auto; 2 = owned autos; 7 = specifically described autos; 8 = hired autos; 9 = nonowned autos."
  },
  {
    s: "Auto Insurance",
    q: "A business that wants liability coverage for employees using their own cars on company errands should carry coverage designated by symbol:",
    c: ["9 — nonowned autos", "7 — described autos", "2 — owned autos", "3 — owned private passenger autos"],
    a: 0,
    e: "Symbol 9 covers autos the business does not own, lease, or hire that are used in the business — including employees' personal vehicles on company business."
  },
  {
    s: "Auto Insurance",
    q: "Part A of the PAP will NOT pay for:",
    c: [
      "Damage to property owned by or being transported by the insured",
      "Damage to another driver's vehicle",
      "Bodily injury to a pedestrian the insured strikes",
      "A judgment for pain and suffering awarded to an injured third party"
    ],
    a: 0,
    e: "Liability coverage excludes damage to property owned by, rented to, in the care of, or transported by the insured (limited exceptions for rented residences and garages)."
  },
  {
    s: "Auto Insurance",
    q: "Which is a duty of the insured after an auto accident under the PAP?",
    c: [
      "Promptly notify the insurer of how, when, and where the accident happened",
      "Admit fault at the scene to speed settlement",
      "Negotiate directly with the other party's insurer",
      "Repair the vehicle before the insurer inspects it"
    ],
    a: 0,
    e: "The insured must give prompt notice, cooperate, forward legal papers, submit to examination, and allow inspection — and should never admit fault or settle on their own."
  },
  {
    s: "Auto Insurance",
    q: "When an insured drives a borrowed (nonowned) auto, the insured's own PAP liability coverage applies:",
    c: ["On an excess basis over the vehicle owner's insurance", "As primary coverage", "Not at all", "Only if the owner is uninsured"],
    a: 0,
    e: "Insurance follows the car first: the owner's policy is primary and the driver's own PAP is excess for a nonowned auto."
  },
  {
    s: "Auto Insurance",
    q: "The 'Extended Non-Owned Coverage' endorsement to a PAP is designed for a person who:",
    c: [
      "Regularly drives an employer-furnished company car",
      "Occasionally rents cars on vacation",
      "Owns multiple personal vehicles",
      "Drives only motorcycles"
    ],
    a: 0,
    e: "A vehicle furnished or available for regular use (like a company car) is excluded under the PAP; the extended non-owned endorsement buys back that coverage."
  },
  {
    s: "Auto Insurance",
    q: "Arizona drivers may satisfy the financial responsibility law by maintaining auto liability insurance or by:",
    c: [
      "Depositing $40,000 in cash or securities with the state treasurer",
      "Signing a promissory note with the MVD",
      "Carrying a $5,000 surety bond",
      "Registering as a self-insurer with only one vehicle"
    ],
    a: 0,
    e: "Alternatives to insurance include a $40,000 deposit with the state treasurer or a certificate of self-insurance (for qualifying fleets)."
  },
  {
    s: "Auto Insurance",
    q: "Damage to the insured's auto caused by upset (rollover) or impact with another object is covered under Part D as:",
    c: ["Collision", "Other-than-collision", "Liability", "Road hazard coverage"],
    a: 0,
    e: "Collision is the upset of the covered auto or its impact with another vehicle or object; most other accidental direct losses are other-than-collision."
  }
];
