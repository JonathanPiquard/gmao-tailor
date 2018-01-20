
GMAO Tailor Concept :


GMAO Tailor's logic is built around models called blueprints. Any user can create one, the instance of this model will be depending of the input values given by the user which creates this instance (directly as a standalone or with an other blueprint).

Blueprint can interact with graphs, functions, blueprint, instance, file, api (via url), ... These interactions occurs in one single interface : the blueprint creation board. Everything is filtered by layers according to the type of the elements or the user's logic.

Every blueprint should have some inputs to avoid to have always the same instance (not really usefull) unless the blueprint use random values. These inputs can be given by the user creating the instance (Form Inputs : the user fulfill a form) or from an other blueprint (Input). Every blueprint can give output values (Output). It can also modify the behavior of a blueprint by overriding the values/connections given to its sub-elements (blueprint elements).

Every blueprint is a dynamic model/object which evolves according to its current values throught the logic bounding the blueprint.
