const ASSET_NAMES = [
  // furniture
  'exit.png',
  'door.png',
  'door_open.png',
  'bush.png',
  'crate.png',
  'boulder.png',
  'leaf_pile.png',
  'mud.png',
  'oak_tree.png',
  'puddle.png',
  'tombstone.png',
  'salt.png',
  'gravel.png',

  // outfits
  'casual_hoodie.png',
  'archeress.png',
  'archery_disciple.png',
  'battle_maid.png',
  'black_swordsman.png',
  'businessman.png',
  'casual_blouse.png',
  'enchantress.png',
  'flower_fighter.png',
  'girl.png',
  'ivory_reaper.png',
  'kendoka.png',
  'kitsune.png',
  'knight.png',
  'knightess.png',
  'kunoichi.png',
  'mage.png',
  'ninja.png',
  'preschooler.png',
  'ranger.png',
  'sorceress.png',
  'warrior.png',
  'warrioress.png',

  // mobs
  'slime.png',
  'goober.png',
  'goblin_king.png',
  'goblin.png',
  'wolf.png',
  'rock_snail.png',

  // items
  'ascension_crystal.png',
  'barans_blades.png',
  'coin_stash.png',
  'copper_dagger.png',
  'descension_crystal.png',
  'desolation.png',
  'excalibur.png',
  'fists.png',
  'gold.png',
  'heavens_arrow.png',
  'hp_potion.png',
  'javelin.png',
  'job_change_ticket.png',
  'kings_resent.png',
  'material.png',
  'monster_shard.png',
  'mp_potion.png',
  'mushroom.png',
  'nails.png',
  'rusty_dagger.png',
  'sharp_rock.png',
  'skill_scrollA.png',
  'skill_scrollB.png',
  'skill_scrollC.png',
  'skill_scrollD.png',
  'skill_scrollE.png',
  'skill_scrollF.png',
  'skill_scrollS.png',
  'slime_goo.png',
  'soulstone.png',
  'stinger.png',
  'twig.png',
  'whip_of_fortune.png',
  'wolf_fang.png',
  'wolf_fur.png',
  'wooden_shield.png',
  'wooden_sword.png',

  // skills
  'slash.png',
  'smash.png',
  'far_shot.png',
  'fireball.png',
  'backstab.png',
  'final_cut.png',
  'burst_blade.png',
  'embrace.png',
  'quick_heal.png',
  'vampiric.png',
  'evade.png',
  'photosynthesis.png',
  'zen_strike.png',
  'haste.png',
  'foxfire.png',
  'bouncy.png',
  'tunnel.png',
  'feral_claw.png',
  'rock_armor.png',
  'salt_spray.png',
  'chomp.png',

  // icons
  'cursor.png',
  'drops.png',
  'heal.png',
  'info.png',
  'inventory.png',
  'job.png',
  'mana.png',
  'outfit.png',
  'shop.png',
  'special.png',
  'stats.png',
  'stunned.png',
  'up.png',
  'weapon.png',
];

export const assets = {};

const downloadPromise = Promise.all(ASSET_NAMES.map(downloadAsset));

function downloadAsset(assetName) {
  return new Promise(resolve => {
    const asset = new Image();
    asset.onload = () => {
      console.log(`Downloaded ${assetName}`);
      assets[assetName] = asset;
      resolve();
    };
    asset.src = `/assets/${assetName}`;
  });
}

export const downloadAssets = () => downloadPromise;

export const getAsset = assetName => assets[assetName];
