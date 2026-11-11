"""Bake the Arena cast from MakeHuman's CC0 assets and the game's animation bind pose.

Usage: python build-zombie-meshes.py MAKEHUMAN_DATA SYSTEM_ASSET_PACK_DIRECTORY
Requires NumPy and Pillow. See models/zombie/CHARACTER-CREDITS.txt for the asset sources.
"""
import functools
import gzip
import json
from pathlib import Path
import re
import struct
import sys

import numpy as np
from PIL import Image, ImageEnhance

GAME = Path(__file__).resolve().parents[1]
TILE, COLUMNS, ROWS = 416, 9, 7
ATLAS_WIDTH, ATLAS_HEIGHT = COLUMNS * TILE, ROWS * TILE
FABRIC_COLORS = (
    (119, 109, 96), (87, 91, 77), (85, 97, 101), (117, 89, 77),
    (95, 80, 82), (121, 117, 104), (81, 80, 72), (107, 94, 76),
    (91, 99, 87), (115, 111, 119), (77, 85, 91), (109, 105, 93),
)

# name, ancestry, body, age, weight, muscle, head, outfit, shoes, hair, skin
CAST = {
    "normal": [
        ("Night cleaner", "african", "female", "old", .16, .08, "oval", "female_casualsuit02", "shoes04", "afro01", "old_african_female"),
        ("Warehouse picker", "caucasian", "male", "old", .19, .22, "square", "male_worksuit01", "shoes02", "", "old_caucasian_male"),
        ("Missing commuter", "asian", "female", "young", -.28, -.26, "diamond", "female_elegantsuit01", "shoes04", "bob01", "middleage_asian_female"),
        ("Accountant", "asian", "male", "young", -.36, -.27, "rectangular", "male_elegantsuit01", "shoes02", "short04", "young_asian_male"),
        ("Night student", "caucasian", "female", "young", .11, -.14, "round", "female_casualsuit01", "shoes01", "ponytail01", "young_caucasian_female"),
        ("Maintenance hand", "african", "male", "young", .31, .14, "invertedtriangular", "male_casualsuit05", "shoes01", "short02", "middleage_african_male"),
    ],
    "fast": [
        ("Track athlete", "african", "female", "young", -.32, .43, "diamond", "female_sportsuit01", "shoes01", "ponytail01", "young_african_female"),
        ("Bike courier", "asian", "male", "young", -.53, .12, "rectangular", "male_casualsuit04", "shoes01", "short02", "young_asian_male"),
        ("Distance runner", "caucasian", "male", "young", -.65, .26, "oval", "male_casualsuit06", "shoes04", "", "young_caucasian_male"),
        ("Escapee", "caucasian", "female", "young", -.51, -.15, "invertedtriangular", "female_casualsuit01", "shoes04", "", "young_caucasian_female"),
        ("Club regular", "asian", "female", "young", -.44, .18, "square", "female_elegantsuit01", "shoes02", "bob01", "middleage_asian_female"),
        ("Dock sprinter", "african", "male", "young", -.47, .54, "round", "male_casualsuit02", "shoes02", "short01", "middleage_african_male"),
    ],
    "gunner": [
        ("Civil guard", "african", "male", "young", .14, .28, "rectangular", "male_casualsuit01", "shoes02", "short01", "middleage_african_male"),
        ("Compound guard", "asian", "female", "young", -.06, .36, "square", "female_casualsuit02", "shoes02", "bob01", "middleage_asian_female"),
        ("Night watch", "caucasian", "male", "old", .23, -.05, "round", "male_worksuit01", "shoes02", "", "old_caucasian_male"),
        ("Escort", "caucasian", "female", "young", -.11, .15, "diamond", "female_elegantsuit01", "shoes04", "ponytail01", "young_caucasian_female"),
        ("Field medic", "asian", "male", "young", -.23, .09, "oval", "male_casualsuit03", "shoes04", "short04", "young_asian_male"),
        ("Contractor", "caucasian", "male", "young", .37, .35, "invertedtriangular", "male_elegantsuit01", "shoes01", "short02", "middleage_caucasian_male"),
    ],
    "tank": [
        ("Press operator", "african", "male", "young", .78, .65, "square", "male_worksuit01", "shoes02", "", "middleage_african_male"),
        ("Former lifter", "african", "female", "young", .37, .92, "round", "female_sportsuit01", "shoes01", "afro01", "young_african_female"),
        ("Forklift driver", "caucasian", "male", "old", .93, .05, "rectangular", "male_casualsuit02", "shoes04", "short01", "old_caucasian_male"),
        ("Kitchen worker", "asian", "female", "young", .77, .38, "oval", "female_casualsuit02", "shoes02", "bob01", "middleage_asian_female"),
        ("Dock boss", "asian", "male", "young", .27, .95, "diamond", "male_casualsuit05", "shoes02", "short04", "young_asian_male"),
        ("Shop owner", "caucasian", "male", "young", .89, .36, "invertedtriangular", "male_casualsuit03", "shoes01", "", "middleage_caucasian_male"),
    ],
    "boss": [
        ("Foundry host", "african", "male", "young", .72, 1.28, "square", "male_worksuit01", "shoes02", "", "middleage_african_male"),
        ("Edematous host", "caucasian", "male", "old", 1.33, .06, "round", "male_casualsuit02", "shoes04", "", "old_caucasian_male"),
        ("Emaciated host", "asian", "male", "young", -.98, -.45, "rectangular", "male_elegantsuit01", "shoes02", "short04", "young_asian_male"),
        ("Fibrotic host", "african", "female", "old", .64, 1.04, "diamond", "female_casualsuit02", "shoes02", "afro01", "old_african_female"),
        ("Asymmetric host", "caucasian", "female", "young", .31, 1.12, "invertedtriangular", "female_sportsuit01", "shoes01", "ponytail01", "young_caucasian_female"),
        ("Collapsed host", "caucasian", "male", "old", -.29, .70, "oval", "male_casualsuit06", "shoes01", "short01", "middleage_caucasian_male"),
    ],
    "hell": [
        ("Furnace host", "african", "female", "young", .48, 1.55, "rectangular", "female_casualsuit01", "shoes02", "", "young_african_female"),
        ("Distended host", "asian", "male", "old", 1.42, .18, "round", "male_casualsuit05", "shoes04", "short04", "young_asian_male"),
        ("Desiccated host", "caucasian", "male", "old", -1.28, -.64, "diamond", "male_casualsuit04", "shoes01", "", "old_caucasian_male"),
        ("Hypertrophic host", "african", "male", "young", .93, 1.58, "square", "male_worksuit01", "shoes02", "short01", "middleage_african_male"),
        ("Excoriated host", "asian", "female", "young", -.35, 1.12, "oval", "female_sportsuit01", "shoes04", "", "middleage_asian_female"),
        ("Necrotic host", "caucasian", "female", "young", .49, .70, "invertedtriangular", "female_elegantsuit01", "shoes02", "bob01", "young_caucasian_female"),
    ],
}


def obj(path):
    vertices, uv, triangles = [], [], {}
    group = "body"
    for line in path.read_text().splitlines():
        values = line.split()
        if not values:
            continue
        token, args = values[0], values[1:]
        if token == "v":
            vertices.append(tuple(map(float, args[:3])))
        elif token == "vt":
            uv.append(tuple(map(float, args[:2])))
        elif token == "g":
            group = args[0]
        elif token == "f":
            points = [tuple(int(part) - 1 for part in pair.split("/")[:2]) for pair in args]
            triangles.setdefault(group, []).extend((points[0], points[i], points[i + 1]) for i in range(1, len(points) - 1))
    return np.array(vertices), np.array(uv), {k: np.array(v) for k, v in triangles.items()}


def glb_bind_pose(path):
    data = path.read_bytes()
    length = struct.unpack_from("<I", data, 12)[0]
    model = json.loads(data[20:20 + length])
    skin = model["skins"][0]
    accessor = model["accessors"][skin["inverseBindMatrices"]]
    view = model["bufferViews"][accessor["bufferView"]]
    offset = length + 28 + view.get("byteOffset", 0) + accessor.get("byteOffset", 0)
    matrices = np.frombuffer(data, dtype="<f4", offset=offset, count=accessor["count"] * 16)
    bind = np.linalg.inv(matrices.reshape(-1, 4, 4).transpose(0, 2, 1))
    names = [model["nodes"][i]["name"].removeprefix("CityDeadOutfit:") for i in skin["joints"]]
    return dict(zip(names, bind[:, :3, 3])), names


def read_target(path, count):
    displacement = np.zeros((count, 3))
    for line in path.read_text().splitlines():
        if line and line[0].isdigit():
            i, *xyz = line.split()
            displacement[int(i)] = list(map(float, xyz))
    return displacement


def target_bone(name):
    bone, _, side = name.partition(".")
    hand = {"L": "Left", "R": "Right"}.get(side, "")
    if bone.startswith("finger"):
        finger, phalanx = bone.removeprefix("finger").split("-")
        return hand + "Hand" + ["Thumb", "Index", "Middle", "Ring", "Pinky"][int(finger) - 1] + phalanx
    if bone.startswith("metacarpal") or bone == "wrist":
        return hand + "Hand"
    if bone.startswith("toe"):
        return hand + "ToeBase"
    return {
        "root": "Hips", "pelvis": "Hips", "spine05": "Hips", "spine04": "Spine",
        "spine03": "Spine", "spine02": "Spine1", "spine01": "Spine2", "breast": "Spine2",
        "clavicle": hand + "Shoulder", "shoulder01": hand + "Arm",
        "upperarm01": hand + "Arm", "upperarm02": hand + "Arm",
        "lowerarm01": hand + "ForeArm", "lowerarm02": hand + "ForeArm",
        "upperleg01": hand + "UpLeg", "upperleg02": hand + "UpLeg",
        "lowerleg01": hand + "Leg", "lowerleg02": hand + "Leg", "foot": hand + "Foot",
        "neck01": "Neck", "neck02": "Neck", "neck03": "Neck",
    }.get(bone, "Head")


def normalize(vector):
    return vector / np.linalg.norm(vector)


def basis(axis, across):
    axis = normalize(axis)
    side = normalize(across - np.dot(axis, across) * axis)
    return np.stack((axis, side, np.cross(axis, side)), axis=1)


def fit_bone(points, start, end, target_start, target_end, guide, target_guide, radius):
    direction, target_direction = end - start, target_end - target_start
    relative = (points - start) @ basis(direction, guide)
    relative *= [np.linalg.norm(target_direction) / np.linalg.norm(direction), radius, radius]
    return relative @ basis(target_direction, target_guide).T + target_start


class Atlas:
    def __init__(self, pack):
        self.pack = pack
        self.image = Image.new("RGBA", (ATLAS_WIDTH, ATLAS_HEIGHT))
        self.tiles = {}

    def remap(self, uv, texture, wardrobe=None):
        key = (texture, wardrobe)
        if key not in self.tiles:
            picture = Image.open(self.pack / texture).convert("RGBA").resize((TILE - 8, TILE - 8), Image.Resampling.LANCZOS)
            alpha = picture.getchannel("A")
            if wardrobe is not None:
                picture = weathered_fabric(picture, texture, wardrobe)
            elif texture.startswith("skins"):
                picture = infected_skin(picture)
            elif texture == "eyes/materials/grey_eye.png":
                picture = clouded_eyes(picture)
            else:
                picture = ImageEnhance.Color(picture.convert("RGB")).enhance(.68)
            picture.putalpha(alpha)
            i = len(self.tiles)
            origin = (i % COLUMNS * TILE + 4, i // COLUMNS * TILE + 4)
            assert origin[1] < ATLAS_HEIGHT, "Atlas is full"
            self.tiles[key] = origin
            self.image.paste(picture, origin)
        x, y = self.tiles[key]
        uv = np.clip(uv, 0, 1)
        uv[:, 1] = 1 - uv[:, 1]
        return (uv * (TILE - 9) + [x + .5, y + .5]) / [ATLAS_WIDTH, ATLAS_HEIGHT]


def infected_skin(image):
    rgb = np.asarray(image, dtype=float)[:, :, :3]
    lightness = rgb @ [.22, .68, .10]
    # Preserve the underlying complexion through the ash and discoloration.
    ash = lightness[:, :, None] * [1.00, 1.06, 1.04]
    y, x = np.mgrid[:rgb.shape[0], :rgb.shape[1]]
    mottling = (np.sin(x * .11 + np.sin(y * .061) * 2) * np.cos(y * .083 - x * .023)) ** 2
    fine = np.random.default_rng(103).random(lightness.shape)
    color = (.30 * rgb + .70 * ash) * (.88 + .09 * fine - .19 * mottling)[:, :, None]
    return Image.fromarray(np.clip(color, 0, 255).astype("uint8"))


def clouded_eyes(image):
    rgb = np.asarray(image, dtype=float)[:, :, :3].copy()
    y, x = np.mgrid[:rgb.shape[0], :rgb.shape[1]]
    for u, v in ((.705, .297), (.293, .701)):
        radius = np.hypot(x / rgb.shape[1] - u, y / rgb.shape[0] - v)
        cloud = (.86 * np.exp(-((radius / .112) ** 4)))[:, :, None]
        rgb = rgb * (1 - cloud) + [173, 185, 177] * cloud
    return Image.fromarray(np.clip(rgb, 0, 255).astype("uint8"))


def wound_field(points, center, extent, phase):
    delta = (points - center) / extent
    radius = np.linalg.norm(delta, axis=1)
    edge = np.sin(delta[:, 0] * 9 + delta[:, 1] * 5 + phase) * np.cos(delta[:, 2] * 7 - delta[:, 1] * 3)
    return np.clip((1.18 - radius + edge * .14) / .63, 0, 1)


def weathered_fabric(image, texture, wardrobe):
    rgb = np.asarray(image, dtype=float)[:, :, :3]
    height, width = rgb.shape[:2]
    y, x = np.mgrid[0:height, 0:width]
    asset = texture.split("/")[1]
    # Clear the repeated print on the source t-shirts before reweaving the color.
    logo_centers = {
        "female_casualsuit01": (.82, .24), "female_casualsuit02": (.82, .24),
        "female_sportsuit01": (.82, .24), "male_casualsuit02": (.58, .18),
        "male_casualsuit04": (.58, .18),
    }
    if asset in logo_centers:
        u, v = logo_centers[asset]
        radius = np.hypot(x / width - u, y / height - v)
        fabric = (radius > .084) & (radius < .11) & (rgb[:, :, 2] > rgb[:, :, 0] * 1.19)
        if fabric.any():
            mask = np.clip((.087 - radius) / .026, 0, 1)[:, :, None]
            rgb = rgb * (1 - mask) + np.median(rgb[fabric], axis=0) * mask
    luminance = rgb @ [0.22, 0.68, 0.10]
    target = np.array(FABRIC_COLORS[wardrobe % len(FABRIC_COLORS)])
    faded = luminance[:, :, None] / 118 * target
    # Uneven bleach, damp patches, and fine fibers remain part of the garment map.
    rng = np.random.default_rng(81073 + wardrobe)
    coarse = Image.fromarray((rng.random((19, 19)) * 255).astype("uint8"))
    coarse = np.asarray(coarse.resize((width, height), Image.Resampling.BICUBIC)) / 255
    dirt = (.68 + .29 * coarse + .047 * rng.random((height, width)))[:, :, None]
    faded *= dirt
    faded = .81 * faded + .19 * rgb * dirt
    return Image.fromarray(np.clip(faded, 0, 255).astype("uint8"))


def surface_normals(points, triangles):
    corners = points[triangles]
    face_normals = np.cross(corners[:, 1] - corners[:, 0], corners[:, 2] - corners[:, 0])
    normals = np.zeros_like(points)
    for i in range(3):
        np.add.at(normals, triangles[:, i], face_normals)
    return normals / np.linalg.norm(normals, axis=1, keepdims=True).clip(1e-8)


def read_proxy(path):
    refs, weights, offsets, hidden, dimensions = [], [], [], [], {}
    section = ""
    for line in path.read_text().splitlines():
        args = line.split()
        if not args or args[0].startswith("#"):
            continue
        if args[0] in ("verts", "delete_verts"):
            section = args[0]
            continue
        if args[0] in ("x_scale", "y_scale", "z_scale"):
            dimensions[args[0][0]] = (int(args[1]), int(args[2]), float(args[3]))
        if not args[0].isdigit():
            continue
        if section == "verts":
            if len(args) == 1:
                refs.append([int(args[0])] * 3)
                weights.append([1., 0., 0.])
                offsets.append([0., 0., 0.])
            else:
                refs.append(list(map(int, args[:3])))
                weights.append(list(map(float, args[3:6])))
                offsets.append(list(map(float, args[6:9])))
        elif section == "delete_verts":
            hidden.extend(int(i) for i in args if i != "-")
            for i, value in enumerate(args):
                if value == "-":
                    hidden.extend(range(int(args[i - 1]) + 1, int(args[i + 1])))
    return np.array(refs), np.array(weights), np.array(offsets), np.array(hidden, dtype=int), dimensions


class Baker:
    def __init__(self, core, pack):
        self.core, self.pack = core, pack
        self.base, self.uv, self.faces = obj(core / "3dobjs/base.obj")
        self.rig = json.loads((core / "rigs/default.mhskel").read_text())
        self.bind, self.bones = glb_bind_pose(GAME / "models/zombie/zombie.glb")
        self.weights = np.zeros((len(self.base), len(self.bones)), dtype=np.float32)
        source = json.loads((core / "rigs/default_weights.mhw").read_text())["weights"]
        self.jaw_weights = np.zeros(len(self.base))
        for name in ("jaw", "oris01", "oris02", "tongue00", "tongue01"):
            pairs = np.array(source.get(name, [])).reshape(-1, 2)
            self.jaw_weights[pairs[:, 0].astype(int)] += pairs[:, 1]
        self.jaw_weights = np.clip(self.jaw_weights * 1.18, 0, 1)
        for key, pairs in source.items():
            target = target_bone(key)
            if target not in self.bones:
                target = re.sub(r"[23]$", "1", target)
            if target not in self.bones:
                target = "Head"
            pairs = np.array(pairs).reshape(-1, 2)
            self.weights[pairs[:, 0].astype(int), self.bones.index(target)] += pairs[:, 1]
        zero = self.weights.sum(1) == 0
        self.weights[zero, self.bones.index("Hips")] = 1
        self.weights /= self.weights.sum(1, keepdims=True)
        self.atlas = Atlas(pack)

    @functools.lru_cache(None)
    def morph(self, name):
        path = self.core / "targets" / (name + ".target")
        return read_target(path, len(self.base)) if path.exists() else np.zeros_like(self.base)

    @functools.lru_cache(None)
    def proxy(self, folder):
        directory = self.pack / folder
        raw, uv, groups = obj(next(directory.glob("*.obj")))
        refs, mix, offsets, hidden, dimensions = read_proxy(next(directory.glob("*.mhclo")))
        assert len(refs) == len(raw), folder
        return raw, uv, np.concatenate(list(groups.values())), refs, mix, offsets, hidden, dimensions

    def joint(self, positions, name):
        bone = self.rig["bones"][name]
        return positions[self.rig["joints"][bone["head"]]].mean(0)

    def fit(self, pos, weights, body, width):
        y = pos[:, 1]
        floor = body[self.faces["body"][:, :, 0], 1].min()
        neck = self.joint(body, "neck01")[1]
        hip = self.joint(body, "upperleg01.L")[1]
        knee = self.joint(body, "lowerleg01.L")[1]
        ankle = self.joint(body, "foot.L")[1]
        top = body[self.faces["body"][:, :, 0], 1].max()
        height = np.interp(y, [floor, ankle, knee, hip, neck, top], [0, 10.2, 45.8, 86, 148, 179])
        height += np.minimum(0, y - floor) * 10 + np.maximum(0, y - top) * 10
        new = np.stack([pos[:, 0] * (10.7 + 1.6 * np.exp(-((y - neck) / 1.15) ** 2)) * width,
                        height, pos[:, 2] * 10.3 - np.interp(height, [0, 92, 143, 179], [3, 1, 5.5, 5.5])], 1)
        for side, suffix in (("Left", ".L"), ("Right", ".R")):
            leg_keys = [side + part for part in ("UpLeg", "Leg", "Foot", "ToeBase")]
            leg = weights[:, [self.bones.index(k) for k in leg_keys]].sum(1)
            source_x = [self.joint(body, bone + suffix)[0] for bone in ("foot", "lowerleg01", "upperleg01")]
            target_x = [self.bind[k][0] for k in (side + "Foot", side + "Leg", side + "UpLeg")]
            new[:, 0] += leg * (np.interp(y, [ankle, knee, hip], target_x)
                                  - np.interp(y, [ankle, knee, hip], source_x) * 10.7 * width)
            shoulder, elbow, wrist = [self.joint(body, bone + suffix) for bone in ("upperarm01", "lowerarm01", "wrist")]
            hand_center = self.joint(body, "finger3-1" + suffix)
            source_index = self.joint(body, "finger2-1" + suffix)
            source_pinky = self.joint(body, "finger5-1" + suffix)
            upper, fore, hand = [self.bind[side + bone] for bone in ("Arm", "ForeArm", "Hand")]
            middle = self.bind[side + "HandMiddle1"]
            target_across = self.bind[side + "HandIndex1"] - self.bind[side + "HandPinky1"]
            across = source_index - source_pinky
            index_groups = [[self.bones.index(side + "Arm")], [self.bones.index(side + "ForeArm")],
                            [i for i, b in enumerate(self.bones) if b.startswith(side + "Hand")]]
            joint_weights = np.stack([weights[:, group].sum(1) for group in index_groups], 1)
            radius = 9.9 * width ** .45
            points = [fit_bone(pos, shoulder, elbow, upper, fore, [0, 0, 1], [0, 0, 1], radius),
                      fit_bone(pos, elbow, wrist, fore, hand, across, target_across, radius),
                      fit_bone(pos, wrist, hand_center, hand, middle, across, target_across, 9.8)]
            new = new * (1 - joint_weights.sum(1, keepdims=True)) + sum(
                p * joint_weights[:, i:i + 1] for i, p in enumerate(points)
            )
        return new

    def garment(self, folder, body):
        raw, uv, faces, refs, mix, offsets, hide, dimensions = self.proxy(folder)
        stretch = np.array([abs(body[i, axis] - body[j, axis]) / size if size else 1
                            for axis, coordinate in enumerate("xyz")
                            for i, j, size in [dimensions.get(coordinate, (0, 0, 0))]])
        coords = (body[refs] * mix[:, :, None]).sum(1) + offsets * stretch
        weights = np.maximum(0, (self.weights[refs] * mix[:, :, None]).sum(1))
        weights /= weights.sum(1, keepdims=True).clip(.001)
        return coords, uv, faces, weights, hide, refs

    def skin_file(self, skin):
        return next((self.pack / "skins" / skin).glob("*.png")).relative_to(self.pack).as_posix()

    def cloth_file(self, folder):
        return next((self.pack / folder).glob("*diffuse.png")).relative_to(self.pack).as_posix()

    def sleeve_cut(self, pos, weights, body, variant):
        side, suffix = ("Left", ".L") if variant % 2 else ("Right", ".R")
        shoulder = self.joint(body, "upperarm01" + suffix)
        wrist = self.joint(body, "wrist" + suffix)
        arm = wrist - shoulder
        along = ((pos - shoulder) @ arm) / np.dot(arm, arm)
        boundary = .44 + .046 * (variant % 3) + .062 * np.sin(pos[:, 2] * 6 + variant)
        influence = weights[:, [self.bones.index(side + "Arm"), self.bones.index(side + "ForeArm")]].sum(1)
        return (influence > .53) & (along > boundary) & (along < 1.07)

    def bake(self, kind, variant, spec):
        name, ancestry, sex, age, fat, muscle, head, dress, shoes, hair, skin = spec
        body = self.base.copy()
        body += self.morph(f"macrodetails/{ancestry}-{sex}-{age}")
        for target, strength in ((f"averagemuscle-{'max' if fat > 0 else 'min'}weight", abs(fat)),
                                 (f"{'max' if muscle > 0 else 'min'}muscle-averageweight", abs(muscle))):
            body += self.morph(f"macrodetails/universal-{sex}-{age}-{target}") * strength
        body += self.morph(f"head/head-{head}") * .86
        body += self.morph("head/head-fat-decr") * (.23 if kind != "tank" else .11)
        body += self.morph("nose/nose-scale-horiz-" + ("incr" if variant % 2 else "decr")) * (.35 + variant * .07)
        cast_index = list(CAST).index(kind)
        wardrobe = 6 * cast_index + variant
        rng = np.random.default_rng(7103 + variant + 11 * cast_index)
        direction = -1 if variant % 2 else 1
        # Open the mouth around the anatomical jaw pivot, keeping the skull and upper teeth in place.
        pivot = self.joint(body, "jaw")
        angle = self.jaw_weights * (.21 + .044 * (variant % 4) + .09 * (kind in ("boss", "hell")))
        relative = body - pivot
        body[:, 1] = pivot[1] + relative[:, 1] * np.cos(angle) - relative[:, 2] * np.sin(angle)
        body[:, 2] = pivot[2] + relative[:, 1] * np.sin(angle) + relative[:, 2] * np.cos(angle)
        cheek = self.joint(body, "eye.L").copy()
        cheek[0] *= direction
        cheek[1] -= .37 + .05 * (variant % 3)
        cheek[2] += .29
        lesion = wound_field(body, cheek, [.30 + .04 * (variant % 2), .38, .35], wardrobe)
        body[:, 2] -= lesion * (.08 + .02 * variant)
        width = (1.05 if kind == "tank" else .96 if kind == "fast" else 1.0) + fat * .065
        if kind in ("boss", "hell"):
            width += [.19, .26, -.09, .11, .09, .07][variant]
            shoulder = np.exp(-((body[:, 1] - self.joint(body, "upperarm01.L")[1]) / 1.55) ** 2)
            core = np.exp(-((body[:, 0] - [.4, -.2, 0, -.9, 1.12, .65][variant]) / 1.24) ** 2)
            amplitude = [.34, .26, -.16, .42, .62, -.28][variant]
            body[:, 2] += shoulder * core * amplitude * (1.65 if kind == "hell" else 1)
        opaque, alpha = [], []
        hidden = np.zeros(len(body), dtype=bool)
        fitted_body = self.fit(body, self.weights, body, width)
        wound_center = fitted_body[np.argmin(np.linalg.norm(body - cheek, axis=1))]
        brow = self.joint(body, "eye.L")
        eye_socket = self.fit(brow[None], self.weights[np.argmax(lesion)][None], body, width)[0]
        if variant in (0, 3, 5):
            tear = [direction * 12.9, 137 - 2.8 * (variant % 3), 10]
            tear_extent = [4.7, 8.6, 9.0]
        else:
            tear = [direction * 12.0, 62 + 5.0 * (variant % 3), 7.5]
            tear_extent = [5.5, 10.2, 7.7]
        for part in (dress, shoes):
            folder = f"clothes/{part}"
            pos, uv, faces, weights, hide, _ = self.garment(folder, body)
            pos += surface_normals(pos, faces[:, :, 0]) * .036
            hidden[hide] = True
            if part == dress and (kind in ("boss", "hell") or variant in (1, 5)):
                cut = self.sleeve_cut(pos, weights, body, variant)
                if cut[faces[:, :, 0]].all(1).any():
                    faces = faces[~cut[faces[:, :, 0]].all(1)]
                    hidden[self.sleeve_cut(body, self.weights, body, variant)] = False
            if part == dress:
                # Split the fabric along an irregular tear. Unmask the skin only
                # in the corresponding area so it remains covered around the edge.
                fitted_cloth = self.fit(pos, weights, body, width)
                rip = wound_field(fitted_cloth[faces[:, :, 0]].mean(1), tear, tear_extent, wardrobe)
                if (rip > .46).any():
                    faces = faces[rip <= .46]
                    exposed = wound_field(fitted_body, tear, np.array(tear_extent) * 1.19, wardrobe)
                    hidden[exposed > .22] = False
            opaque.append((pos, uv, faces, weights, self.cloth_file(folder), "outfit" if part == dress else "fabric"))
        faces = self.faces["body"]
        visible = ~hidden[faces[:, :, 0]].any(1)
        opaque.append((body, self.uv, faces[visible], self.weights, self.skin_file(skin), "skin"))
        eye = self.garment("eyes/low-poly", body)
        opaque.append((*eye[:4], "eyes/materials/grey_eye.png", "eyes"))
        if (self.pack / "teeth/teeth_base").exists():
            teeth = self.garment("teeth/teeth_base", body)
            opaque.append((*teeth[:4], "teeth/teeth_base/teeth.png", "teeth"))
        if hair:
            folder = f"hair/{hair}"
            part = self.garment(folder, body)
            alpha.append((*part[:4], self.cloth_file(folder), "hair"))

        arrays, indices, opaque_count, count = [], [], 0, 0
        for pos, uv, faces, weights, image, surface in opaque + alpha:
            fitted = fitted_body if surface == "skin" else self.fit(pos, weights, body, width)
            wound = wound_field(fitted, wound_center, [4.2, 6.4, 4.8], wardrobe)
            injury = wound_field(fitted, tear, np.array(tear_extent) * 1.32, wardrobe)
            dirt = .5 + .5 * np.sin(fitted[:, 0] * .32 + fitted[:, 1] * .14) * np.sin(fitted[:, 2] * .43 + fitted[:, 1] * .28)
            dirt = dirt ** 3 * (.34 if surface in ("fabric", "outfit") else .18)
            stain = np.clip(dirt + rng.random(len(dirt)) * .045 + wound * .75 + injury * .68, 0, .89)
            if surface == "skin":
                mouth = [direction * 1.0, wound_center[1] - 4.5, wound_center[2] + 1.9]
                crust = wound_field(fitted, mouth, [5.1, 5.6, 4.0], wardrobe * .7)
                sockets = np.maximum(
                    wound_field(fitted, eye_socket + [0, .4, 1.9], [3.6, 3.0, 3.4], wardrobe),
                    wound_field(fitted, eye_socket * [-1, 1, 1] + [0, .4, 1.9], [3.6, 3.0, 3.4], wardrobe),
                )
                stain = np.maximum(stain, np.maximum(crust * .78, sockets * .61))
            elif surface == "outfit":
                smear = wound_field(fitted, [direction * 5, 138, 14], [8.8, 19, 9], wardrobe)
                stain = np.maximum(stain, smear * (.48 + .05 * (variant % 4)))
            base_tone = [.78, .89, .87] if surface == "skin" else [.82, .87, .85]
            stain_tone = [.46, .075, .08] if surface == "skin" else [.40, .085, .067]
            color = (1 - stain[:, None]) * base_tone + stain[:, None] * stain_tone
            if kind == "hell" and surface == "skin":
                color *= [.81, .58, .55]
            if surface in ("eyes", "hair", "teeth"):
                color[:] = [.98, .98, .92] if surface == "eyes" else [.68, .59, .52]
            # Weld normals before splitting UV seams. The OBJ indices still share skin vertices.
            normals = surface_normals(fitted, faces[:, :, 0])
            corners, faces_i = np.unique(faces.reshape(-1, 2), axis=0, return_inverse=True)
            source, tex = corners.T
            joints = np.argsort(weights[source], axis=1)[:, -4:][:, ::-1]
            amount = np.take_along_axis(weights[source], joints, 1)
            amount /= amount.sum(1, keepdims=True).clip(.001)
            amount = (amount * 255).round().astype(int)
            amount[:, 0] += 255 - amount.sum(1)
            tile = self.atlas.remap(uv[tex], image, wardrobe if surface == "outfit" else None)
            arrays.append((fitted[source], tile, normals[source],
                           joints, amount, color[source]))
            indices.append(faces_i + count)
            count += len(corners)
            if surface != "hair":
                opaque_count += len(faces_i)
        p, uv, n, joints, weight, color = map(np.concatenate, zip(*arrays))
        ind = np.concatenate(indices)
        assert count < 65536 and np.isfinite(p).all()
        parts = [(p * 100).round().astype("<i2"), (uv * 65535).round().astype("<u2"),
                 ind.astype("<u2"), (n * 127).round().astype("i1"), joints.astype("u1"),
                 weight.astype("u1"), (color * 255).round().astype("u1")]
        return {"id": f"{kind}-{variant}", "name": name, "vertices": count, "indices": len(ind),
                "opaque": opaque_count}, b"".join(a.tobytes() for a in parts)


def main():
    baker = Baker(Path(sys.argv[1]), Path(sys.argv[2]))
    records, blocks, offset = [], [], 0
    for kind, designs in CAST.items():
        for index, spec in enumerate(designs):
            record, block = baker.bake(kind, index, spec)
            block += bytes(-len(block) % 4)
            record["offset"] = offset
            offset += len(block)
            records.append(record)
            blocks.append(block)
            print(record["id"], record["name"], record["vertices"], record["indices"] // 3, flush=True)
    output = GAME / "models/zombie"
    header = json.dumps({"models": records, "joints": baker.bones}, separators=(",", ":")).encode()
    header += b" " * (-len(header) % 4)
    with (output / "character-meshes.bin.gz").open("wb") as file:
        with gzip.GzipFile(fileobj=file, mode="wb", mtime=0, filename="") as packed:
            packed.write(struct.pack("<I", len(header)))
            packed.write(header)
            for block in blocks:
                packed.write(block)
    baker.atlas.image.save(output / "character-atlas.webp", quality=85, method=5)


if __name__ == "__main__":
    main()
